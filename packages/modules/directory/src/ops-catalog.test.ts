import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { CatalogWriteError, movedSequence, parseCatalogColumns } from './ops-catalog-shared';
import { createAttributeField, deleteAttributeField, updateCatalogFieldSpan } from './ops-catalog-fields';
import { listOpsCatalog } from './ops-catalog';
import { deleteCatalogGroup, updateCatalogGroupColumns } from './ops-catalog-groups';

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

describe('ops catalog', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('rejects a name that does not slugify', async () => {
    await expect(
      createAttributeField('c1', { groupId: 'g1', name: '!!!', type: 'text', labelPt: 'X', labelEn: 'X' })
    ).rejects.toBeInstanceOf(CatalogWriteError);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('rejects deleting a locked person field', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ storage: 'person' }] } as never);
    await expect(deleteAttributeField('c1', 'f1')).rejects.toMatchObject({ message: 'LOCKED' });
    expect(mockedQuery).toHaveBeenCalledTimes(1);
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
          filterable: true,
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
          filterable: false,
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
    await updateCatalogGroupColumns('c1', 'g1', 3);
    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('SET columns = $3'),
      ['g1', 'c1', 3]
    );
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
});

describe('parseCatalogColumns', () => {
  it('falls back when the value is omitted', () => {
    expect(parseCatalogColumns(undefined, 1)).toBe(1);
  });
});
