import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
  withOpsContext: vi.fn(async (fn: (client: { query: typeof query }) => Promise<unknown>) =>
    fn({ query: vi.mocked(query) })
  ),
}));

import { query, withOpsContext } from '@community/db';
import { CatalogWriteError } from './ops-catalog-shared';
import {
  applyChoiceOptions,
  diffChoiceOptions,
  previewChoiceOptions,
  riskyAckKeys,
} from './ops-catalog-options';

const mockedQuery = vi.mocked(query);

describe('diffChoiceOptions', () => {
  it('classifies add, label change and remove with usage', () => {
    const changes = diffChoiceOptions({
      before: [{ value: 'mvp', labelPt: 'MVP', labelEn: 'MVP' }],
      after: [
        { value: 'traction', labelPt: 'Tração', labelEn: 'Traction' },
        { value: 'idea', labelPt: 'Ideação', labelEn: 'Idea' },
      ],
      usageCounts: { mvp: 4 },
    });
    expect(changes).toEqual([
      { kind: 'remove', value: 'mvp', count: 4, requiresMigration: true },
      { kind: 'add', value: 'traction', count: 0, requiresMigration: false },
      { kind: 'add', value: 'idea', count: 0, requiresMigration: false },
    ]);
  });

  it('treats explicit rename separately from remove/add', () => {
    const changes = diffChoiceOptions({
      before: [{ value: 'mvp', labelPt: 'MVP', labelEn: 'MVP' }],
      after: [{ value: 'traction', labelPt: 'Tração', labelEn: 'Traction' }],
      renames: [{ from: 'mvp', to: 'traction' }],
      usageCounts: { mvp: 2 },
    });
    expect(changes.some((item) => item.kind === 'rename' && item.from === 'mvp' && item.to === 'traction')).toBe(true);
    expect(changes.some((item) => item.kind === 'remove')).toBe(false);
  });

  it('marks label-only edits as safe', () => {
    const changes = diffChoiceOptions({
      before: [{ value: 'mvp', labelPt: 'MVP', labelEn: 'MVP' }],
      after: [{ value: 'mvp', labelPt: 'MVP atualizado', labelEn: 'Updated MVP' }],
      usageCounts: { mvp: 9 },
    });
    expect(changes).toEqual([
      { kind: 'label_change', value: 'mvp', count: 0, requiresMigration: false },
    ]);
    expect(riskyAckKeys(changes)).toEqual([]);
  });
});

describe('previewChoiceOptions', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('returns safe preview when only labels change', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ value: 'mvp', count: 3 }] }).mockResolvedValueOnce({ rows: [{ total: 0 }] });
    const preview = await previewChoiceOptions({
      communityId: 'c1',
      fieldName: 'stage',
      fieldType: 'select',
      beforeOptions: [{ value: 'mvp', label: [{ locale: 'pt-BR', value: 'MVP' }] }],
      options: [{ value: 'mvp', labelPt: 'MVP novo', labelEn: 'New MVP' }],
    });
    expect(preview.safe).toBe(true);
    expect(preview.changes.some((item) => item.kind === 'label_change')).toBe(true);
    expect(preview.usage.mvp).toBe(3);
  });
});

describe('applyChoiceOptions', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    vi.mocked(withOpsContext).mockImplementation(async (fn) => fn({ query: mockedQuery }));
  });

  it('rejects apply when risky changes are not acknowledged', async () => {
    mockedQuery
      .mockResolvedValueOnce({
        rows: [{ id: 'f1', name: 'stage', type: 'select', storage: 'attributes', options: [{ value: 'mvp', label: [] }] }],
      })
      .mockResolvedValueOnce({ rows: [{ value: 'mvp', count: 2 }] })
      .mockResolvedValueOnce({ rows: [{ total: 2 }] });
    await expect(
      applyChoiceOptions({
        communityId: 'c1',
        fieldId: 'f1',
        options: [{ value: 'idea', labelPt: 'Ideia', labelEn: 'Idea' }],
        acknowledged: [],
      })
    ).rejects.toMatchObject({ message: 'ACK_MISMATCH' });
  });
});
