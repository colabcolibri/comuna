import { localizedPair, parseLocalized, pickLocalizedText } from '@community/identity';
import type { QueryFn } from './db-types';
import { ensureDefaultTalentCategories, listTalentCategories, slugifyCategoryCode, type TalentCategory } from './talent-categories';

export class TalentCategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TalentCategoryError';
  }
}

function parseLabelInput(body: Record<string, unknown>) {
  const labelPt = typeof body.labelPt === 'string' ? body.labelPt.trim() : '';
  const labelEn = typeof body.labelEn === 'string' ? body.labelEn.trim() : '';
  if (!labelPt) {
    throw new TalentCategoryError('Nome em português obrigatório.');
  }
  return localizedPair(labelPt, labelEn || labelPt);
}

export async function listOpsTalentCategories(communityId: string, query: QueryFn) {
  await ensureDefaultTalentCategories(query, communityId);
  return listTalentCategories(query, communityId, { enabledOnly: false });
}

export async function createOpsTalentCategory(
  communityId: string,
  query: QueryFn,
  body: Record<string, unknown>
): Promise<TalentCategory> {
  await ensureDefaultTalentCategories(query, communityId);
  const label = parseLabelInput(body);
  const rawCode = typeof body.code === 'string' ? body.code.trim() : '';
  const id = slugifyCategoryCode(rawCode || pickLocalizedText(label, 'pt-BR'));
  const allowsOtherText = body.allowsOtherText === true;
  const maxOrder = await query(
    `SELECT coalesce(max(sort_order), 0)::int AS max FROM plugin_talent.categories WHERE community_id = $1`,
    [communityId]
  );
  const sortOrder = Number(maxOrder.rows[0]?.max || 0) + 10;
  try {
    const inserted = await query(
      `INSERT INTO plugin_talent.categories (community_id, id, sort_order, label, allows_other_text, enabled)
       VALUES ($1, $2, $3, $4::jsonb, $5, true)
       RETURNING id, sort_order, label, allows_other_text, enabled`,
      [communityId, id, sortOrder, JSON.stringify(label), allowsOtherText]
    );
    const row = inserted.rows[0];
    if (!row) {
      throw new TalentCategoryError('Não foi possível criar a categoria.');
    }
    return {
      id: String(row.id),
      sortOrder: Number(row.sort_order),
      label: parseLocalized(row.label),
      allowsOtherText: row.allows_other_text === true,
      enabled: row.enabled !== false,
    };
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new TalentCategoryError('Já existe uma categoria com esse código.');
    }
    throw err;
  }
}

export async function updateOpsTalentCategory(
  communityId: string,
  categoryId: string,
  query: QueryFn,
  body: Record<string, unknown>
): Promise<TalentCategory> {
  const existing = await query(
    `SELECT id, sort_order, label, allows_other_text, enabled
     FROM plugin_talent.categories
     WHERE community_id = $1 AND id = $2`,
    [communityId, categoryId]
  );
  if (!existing.rows[0]) {
    throw new TalentCategoryError('Categoria inexistente.');
  }
  const label = body.labelPt !== undefined || body.labelEn !== undefined
    ? parseLabelInput({
        labelPt: body.labelPt ?? pickLocalizedText(parseLocalized(existing.rows[0].label), 'pt-BR'),
        labelEn: body.labelEn ?? pickLocalizedText(parseLocalized(existing.rows[0].label), 'en'),
      })
    : parseLocalized(existing.rows[0].label);
  const allowsOtherText =
    body.allowsOtherText === undefined ? existing.rows[0].allows_other_text === true : body.allowsOtherText === true;
  const enabled = body.enabled === undefined ? existing.rows[0].enabled !== false : body.enabled === true;
  const sortOrder =
    typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
      ? Math.trunc(body.sortOrder)
      : Number(existing.rows[0].sort_order);
  const updated = await query(
    `UPDATE plugin_talent.categories
     SET label = $3::jsonb, allows_other_text = $4, enabled = $5, sort_order = $6
     WHERE community_id = $1 AND id = $2
     RETURNING id, sort_order, label, allows_other_text, enabled`,
    [communityId, categoryId, JSON.stringify(label), allowsOtherText, enabled, sortOrder]
  );
  const row = updated.rows[0];
  return {
    id: String(row.id),
    sortOrder: Number(row.sort_order),
    label: parseLocalized(row.label),
    allowsOtherText: row.allows_other_text === true,
    enabled: row.enabled !== false,
  };
}

export async function deleteOpsTalentCategory(communityId: string, categoryId: string, query: QueryFn) {
  const used = await query(
    `SELECT count(*)::int AS total FROM plugin_talent.offerings WHERE community_id = $1 AND category_id = $2`,
    [communityId, categoryId]
  );
  if ((used.rows[0]?.total as number) > 0) {
    throw new TalentCategoryError('Há ofertas usando esta categoria. Desative em vez de apagar.');
  }
  const removed = await query(
    `DELETE FROM plugin_talent.categories WHERE community_id = $1 AND id = $2 RETURNING id`,
    [communityId, categoryId]
  );
  if (!removed.rows[0]) {
    throw new TalentCategoryError('Categoria inexistente.');
  }
}
