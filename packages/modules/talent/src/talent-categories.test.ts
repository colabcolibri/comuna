import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_TALENT_CATEGORY_SEED } from './category-seed';
import {
  categoryLabel,
  ensureDefaultTalentCategories,
  listTalentCategories,
  parseTalentCategoryFilter,
} from './talent-categories';

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

  it('skips the default insert when the database session is read-only', async () => {
    const previous = process.env.DATABASE_READ_ONLY;
    process.env.DATABASE_READ_ONLY = '1';
    const query = vi.fn(async () => ({
      rows: [{ id: 'mentorship', sort_order: 10, label: [], allows_other_text: false, enabled: true }],
    }));
    try {
      const rows = await listTalentCategories(query, 'community-1');
      expect(query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO plugin_talent.categories'))).toBe(false);
      expect(rows).toHaveLength(1);
      await ensureDefaultTalentCategories(query, 'community-1');
      expect(query).toHaveBeenCalledTimes(1);
    } finally {
      if (previous === undefined) {
        delete process.env.DATABASE_READ_ONLY;
      } else {
        process.env.DATABASE_READ_ONLY = previous;
      }
    }
  });
});

describe('categoryLabel', () => {
  it('resolves default seed ids without a live catalog', () => {
    expect(categoryLabel('mentorship', 'pt-BR', [])).toBe('Mentoria');
    expect(categoryLabel('mentorship', 'en', [])).toBe('Mentorship');
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
