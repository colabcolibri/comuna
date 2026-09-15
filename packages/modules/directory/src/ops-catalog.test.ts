import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { CatalogWriteError, createAttributeField, deleteAttributeField, listOpsCatalog } from './ops-catalog';

const mockedQuery = vi.mocked(query);

describe('ops catalog', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('rejects a name that does not slugify', async () => {
    await expect(
      createAttributeField('c1', { name: '!!!', type: 'text', labelPt: 'X', labelEn: 'X' })
    ).rejects.toBeInstanceOf(CatalogWriteError);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('rejects deleting a locked person field', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ storage: 'person', slug: 'identity' }] } as never);
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
    expect(groups[0].fields[0].name).toBe('host_at_home');
  });

  it('locks attribute fields outside the custom group', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          group_id: 'g1',
          group_slug: 'hospitality',
          group_label: [{ locale: 'pt-BR', value: 'Hospitalidade' }],
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
    expect(groups[0].fields[0].locked).toBe(true);
  });
});
