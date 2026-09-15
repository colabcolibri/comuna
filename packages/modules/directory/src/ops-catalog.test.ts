import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { CatalogWriteError, movedSequence, parseCatalogColumns } from './ops-catalog-shared';
import { createAttributeField, deleteAttributeField, updateCatalogFieldDescription, updateCatalogFieldRequired, updateCatalogFieldSpan, normalizeOpsChoiceOptions } from './ops-catalog-fields';
import { saveOpsListFields } from './ops-list-fields';
import { listOpsCatalog } from './ops-catalog';
import { deleteCatalogGroup, updateCatalogGroupColumns } from './ops-catalog-groups';
import { moveCatalogFieldToGroup, resetCatalogOrder } from './ops-catalog-order';

const mockedQuery = vi.mocked(query);

describe('movedSequence', () => {
  it('moves an id up without mutating the source', () => {
    const source = ['a', 'b', 'c'];
    expect(movedSequence(source, 'c', 'up')).toEqual(['a', 'c', 'b']);
    expect(source).toEqual(['a', 'b', 'c']);
  });

  it('returns null at the boundary', () => {
    expect(movedSequence(['a', 'b'], 'a', 'up')).toBeNull();
  });
});

describe('normalizeOpsChoiceOptions', () => {
  it('accepts structured option rows and rejects duplicate values', () => {
    expect(
      normalizeOpsChoiceOptions({
        options: [
          { value: '2014', labelPt: '2014', labelEn: '2014' },
          { value: '2022', labelPt: '2022', labelEn: '2022' },
        ],
      })
    ).toHaveLength(2);
    expect(() =>
      normalizeOpsChoiceOptions({
        options: [
          { value: '2014', labelPt: '2014', labelEn: '2014' },
          { value: '2014', labelPt: 'outra', labelEn: 'other' },
        ],
      })
    ).toThrow(CatalogWriteError);
  });
});

describe('ops catalog', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('rejects choice fields with duplicate option values', async () => {
    await expect(
      createAttributeField('c1', {
        groupId: 'g1',
        name: 'editions',
        type: 'checkbox',
        labelPt: 'Edições',
        labelEn: 'Editions',
        descriptionPt: 'Anos da turma',
        descriptionEn: 'Cohort years',
        optionsText: '2014|2014|2014\n2014|outra|other',
      })
    ).rejects.toBeInstanceOf(CatalogWriteError);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('rejects choice fields with no options', async () => {
    await expect(
      createAttributeField('c1', {
        groupId: 'g1',
        name: 'editions',
        type: 'select',
        labelPt: 'Edições',
        labelEn: 'Editions',
        descriptionPt: 'Anos da turma',
        descriptionEn: 'Cohort years',
        optionsText: '',
      })
    ).rejects.toBeInstanceOf(CatalogWriteError);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('rejects a name that does not slugify', async () => {
    await expect(
      createAttributeField('c1', {
        groupId: 'g1',
        name: '!!!',
        type: 'text',
        labelPt: 'X',
        labelEn: 'X',
        descriptionPt: 'Ajuda',
        descriptionEn: 'Help',
      })
    ).rejects.toBeInstanceOf(CatalogWriteError);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('rejects a field without description', async () => {
    await expect(
      createAttributeField('c1', {
        groupId: 'g1',
        name: 'host',
        type: 'boolean',
        labelPt: 'Casa',
        labelEn: 'Home',
        descriptionPt: '',
        descriptionEn: '',
      })
    ).rejects.toBeInstanceOf(CatalogWriteError);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('rejects deleting a locked person field', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ storage: 'person', enabled: false }] } as never);
    await expect(deleteAttributeField('c1', 'f1')).rejects.toMatchObject({ message: 'LOCKED' });
    expect(mockedQuery).toHaveBeenCalledTimes(1);
  });

  it('rejects deleting an extra field that is still on', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ storage: 'attributes', enabled: true }] } as never);
    await expect(deleteAttributeField('c1', 'f1')).rejects.toMatchObject({ message: 'ACTIVE' });
  });

  it('groups fields under their catalog group', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          group_id: 'g1',
          group_slug: 'custom',
          group_label: [{ locale: 'pt-BR', value: 'Custom' }],
          group_columns: 1,
          field_id: 'f1',
          name: 'host_at_home',
          type: 'boolean',
          storage: 'attributes',
          label: [{ locale: 'pt-BR', value: 'Casa' }],
        },
      ],
    } as never);
    const groups = await listOpsCatalog('c1');
    expect(groups[0].fields[0].locked).toBe(false);
    expect(groups[0].locked).toBe(false);
    expect(groups[0].fields[0].name).toBe('host_at_home');
  });

  it('locks seed groups and person storage, not extra attributes', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          group_id: 'g1',
          group_slug: 'identity',
          group_label: [{ locale: 'pt-BR', value: 'Identidade' }],
          group_columns: 1,
          field_id: 'f1',
          name: 'full_name',
          type: 'text',
          storage: 'person',
          label: [{ locale: 'pt-BR', value: 'Nome' }],
        },
      ],
    } as never);
    const groups = await listOpsCatalog('c1');
    expect(groups[0].locked).toBe(true);
    expect(groups[0].fields[0].locked).toBe(true);
  });

  it('rejects deleting a seed group', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ slug: 'identity', n: 0 }] } as never);
    await expect(deleteCatalogGroup('c1', 'g1')).rejects.toMatchObject({ message: 'LOCKED' });
  });

  it('updates columns on a seed group', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'g1' }] } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await updateCatalogGroupColumns('c1', 'g1', 3);
    expect(mockedQuery.mock.calls[1]?.[1]).toEqual(['g1', 'c1', 3]);
    expect(String(mockedQuery.mock.calls[1]?.[0])).toContain('SET columns = $3');
  });

  it('rejects columns outside 1-3', async () => {
    await expect(updateCatalogGroupColumns('c1', 'g1', 4)).rejects.toMatchObject({ message: 'VALIDATION_ERROR' });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('updates span on a locked field without touching label', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'f1' }] } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await updateCatalogFieldSpan('c1', 'f1', 2);
    expect(String(mockedQuery.mock.calls[1]?.[0])).toContain('SET span');
  });

  it('updates required on a locked field', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'f1' }] } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await updateCatalogFieldRequired('c1', 'f1', true);
    expect(String(mockedQuery.mock.calls[1]?.[0])).toContain('SET required');
  });

  it('creates an extra field without a filter column and seeds both lists', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ id: 'g1' }] } as never)
      .mockResolvedValueOnce({ rows: [{ n: 0 }] } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'f1',
            name: 'host',
            type: 'boolean',
            storage: 'attributes',
            span: 1,
            required: false,
            enabled: true,
            options: [],
            label: [{ locale: 'pt-BR', value: 'Casa' }],
            description: [{ locale: 'pt-BR', value: 'Ajuda' }],
          },
        ],
      } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    await createAttributeField('c1', {
      groupId: 'g1',
      name: 'host',
      type: 'boolean',
      labelPt: 'Casa',
      labelEn: 'Home',
      descriptionPt: 'Ajuda',
      descriptionEn: 'Help',
    });
    expect(String(mockedQuery.mock.calls[2]?.[0])).toContain('INSERT INTO plugin_directory.fields');
    expect(String(mockedQuery.mock.calls[2]?.[0])).not.toMatch(/filterable/);
    expect(String(mockedQuery.mock.calls[3]?.[0])).toContain('list_fields');
    expect(String(mockedQuery.mock.calls[3]?.[0])).toContain("'directory'");
    expect(String(mockedQuery.mock.calls[3]?.[0])).toContain("'showcase'");
  });

  it('saves list placement without touching field copy', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'f1', name: 'host_at_home', type: 'boolean', column_key: null }],
    } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await saveOpsListFields('c1', 'showcase', [{ fieldId: 'f1', filterable: true, placement: 'detail' }]);
    expect(String(mockedQuery.mock.calls[1]?.[0])).toContain('list_fields');
    expect(mockedQuery.mock.calls[1]?.[1]).toEqual(['f1', 'showcase', true, 'detail']);
  });

  it('keeps showcase PII off even if ops asks for card and filter', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'f1', name: 'gender', type: 'select', column_key: 'gender' }],
    } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await saveOpsListFields('c1', 'showcase', [{ fieldId: 'f1', filterable: true, placement: 'card' }]);
    expect(mockedQuery.mock.calls[1]?.[1]).toEqual(['f1', 'showcase', false, 'off']);
  });

  it('moves a field to another group in the same community', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ group_id: 'g1' }] } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'g2' }] } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await moveCatalogFieldToGroup('c1', 'f1', 'g2');
    expect(String(mockedQuery.mock.calls[2]?.[0])).toContain('SET group_id');
  });

  it('rejects moving a field to a group from another tenant', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ group_id: 'g1' }] } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await expect(moveCatalogFieldToGroup('c1', 'f1', 'other')).rejects.toMatchObject({ message: 'NOT_FOUND' });
  });

  it('updates description on a locked field', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'f1' }] } as never);
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await updateCatalogFieldDescription('c1', 'f1', {
      descriptionPt: 'Nome e sobrenome',
      descriptionEn: 'First and last name',
    });
    expect(String(mockedQuery.mock.calls[1]?.[0])).toContain('SET description');
  });

  it('resets seed group order without moving fields across groups', async () => {
    mockedQuery
      .mockResolvedValueOnce({
        rows: [
          { id: 'g-custom', slug: 'custom' },
          { id: 'g-identity', slug: 'identity' },
        ],
      } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [{ id: 'f-extra', name: 'cohort' }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({
        rows: [
          { id: 'f-avatar', name: 'avatar_url' },
          { id: 'f-name', name: 'full_name' },
        ],
      } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    await resetCatalogOrder('c1');
    expect(mockedQuery.mock.calls[1]?.[1]).toEqual(['g-identity', 10]);
    expect(mockedQuery.mock.calls[2]?.[1]).toEqual(['g-custom', 20]);
    expect(mockedQuery.mock.calls[6]?.[1]).toEqual(['f-name', 10]);
    expect(mockedQuery.mock.calls[7]?.[1]).toEqual(['f-avatar', 20]);
  });
});

describe('parseCatalogColumns', () => {
  it('falls back when the value is omitted', () => {
    expect(parseCatalogColumns(undefined, 1)).toBe(1);
  });
});
