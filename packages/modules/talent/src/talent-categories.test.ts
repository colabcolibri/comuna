import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_TALENT_CATEGORY_SEED } from './category-seed';
import { listTalentCategories, parseTalentCategoryFilter } from './talent-categories';

describe('DEFAULT_TALENT_CATEGORY_SEED', () => {
  it('ships the six demo categories including other', () => {
    expect(DEFAULT_TALENT_CATEGORY_SEED.map((row) => row.id)).toEqual([
      'mentorship',
      'project',
      'hiring',
      'teaching',
      'volunteering',
      'other',
    ]);
    expect(DEFAULT_TALENT_CATEGORY_SEED.find((row) => row.id === 'other')?.allowsOtherText).toBe(true);
  });
});

describe('listTalentCategories', () => {
  it('ensures defaults before listing', async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('INSERT INTO plugin_talent.categories')) {
        return { rows: [] };
      }
      return {
        rows: [{ id: 'mentorship', sort_order: 10, label: [], allows_other_text: false, enabled: true }],
      };
    });
    const rows = await listTalentCategories(query, 'community-1');
    expect(query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO plugin_talent.categories'))).toBe(true);
    expect(rows).toHaveLength(1);
  });
});

describe('parseTalentCategoryFilter', () => {
  it('accepts ids from the community catalog', () => {
    expect(parseTalentCategoryFilter('mentorship', ['mentorship', 'project'])).toBe('mentorship');
  });

  it('rejects unknown ids', () => {
    expect(parseTalentCategoryFilter('nope', ['mentorship'])).toBe('');
  });
});
