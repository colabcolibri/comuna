import { parseLocalized, pickLocalizedText, type LocalizedText } from '@community/identity';
import type { QueryFn } from './db-types';
import { DEFAULT_TALENT_CATEGORY_SEED } from './category-seed';

export type TalentCategory = {
  id: string;
  sortOrder: number;
  label: LocalizedText;
  allowsOtherText: boolean;
  enabled: boolean;
};

function rowToCategory(row: Record<string, unknown>): TalentCategory {
  return {
    id: String(row.id),
    sortOrder: Number(row.sort_order),
    label: parseLocalized(row.label),
    allowsOtherText: row.allows_other_text === true,
    enabled: row.enabled !== false,
  };
}

function databaseIsReadOnly(): boolean {
  return process.env.DATABASE_READ_ONLY === '1';
}

export async function ensureDefaultTalentCategories(query: QueryFn, communityId: string) {
  if (databaseIsReadOnly()) {
    return;
  }
  for (const item of DEFAULT_TALENT_CATEGORY_SEED) {
    await query(
      `INSERT INTO plugin_talent.categories (community_id, id, sort_order, label, allows_other_text, enabled)
       VALUES ($1, $2, $3, $4::jsonb, $5, true)
       ON CONFLICT (community_id, id) DO NOTHING`,
      [communityId, item.id, item.sortOrder, JSON.stringify(item.label), item.allowsOtherText]
    );
  }
}

export async function listTalentCategories(query: QueryFn, communityId: string, opts?: { enabledOnly?: boolean }) {
  await ensureDefaultTalentCategories(query, communityId);
  const enabledOnly = opts?.enabledOnly !== false;
  const result = await query(
    `SELECT id, sort_order, label, allows_other_text, enabled
     FROM plugin_talent.categories
     WHERE community_id = $1 ${enabledOnly ? 'AND enabled = true' : ''}
     ORDER BY sort_order, id`,
    [communityId]
  );
  return result.rows.map(rowToCategory);
}

export function categoryLabel(
  id: string,
  locale: 'pt-BR' | 'en',
  catalog: Pick<TalentCategory, 'id' | 'label'>[]
): string {
  const row = catalog.find((item) => item.id === id);
  if (row) {
    return pickLocalizedText(row.label, locale) || pickLocalizedText(row.label, 'pt-BR') || id;
  }
  const seed = DEFAULT_TALENT_CATEGORY_SEED.find((item) => item.id === id);
  if (seed) {
    let seedLabel = parseLocalized(seed.label);
    if (!seedLabel.length && seed.label && typeof seed.label === 'object' && !Array.isArray(seed.label)) {
      const map = seed.label as Record<string, string>;
      seedLabel = parseLocalized([
        { locale: 'pt-BR', value: map['pt-BR'] || '' },
        { locale: 'en', value: map.en || map['pt-BR'] || '' },
      ]);
    }
    return pickLocalizedText(seedLabel, locale) || pickLocalizedText(seedLabel, 'pt-BR') || id;
  }
  return id;
}

export function parseTalentCategoryFilter(raw: string | null | undefined, allowedIds: Iterable<string>): string {
  const id = (raw || '').trim();
  if (!id) {
    return '';
  }
  const allowed = new Set(allowedIds);
  return allowed.has(id) ? id : '';
}

export function slugifyCategoryCode(raw: string): string {
  const base = raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return base || 'category';
}
