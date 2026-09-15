import { query } from '@community/db';
import { localizedPair, parseLocalized, pickLocalizedText, type LocalizedText } from '@community/identity';

export const ATTRIBUTE_FIELD_TYPES = ['text', 'textarea', 'boolean', 'select', 'url'] as const;
export type AttributeFieldType = (typeof ATTRIBUTE_FIELD_TYPES)[number];

export class CatalogWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogWriteError';
  }
}

export type OpsCatalogField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  locked: boolean;
  filterable: boolean;
  label: LocalizedText;
};

export type OpsCatalogGroup = {
  id: string;
  slug: string;
  label: LocalizedText;
  fields: OpsCatalogField[];
};

export async function listOpsCatalog(communityId: string): Promise<OpsCatalogGroup[]> {
  const result = await query<{
    group_id: string;
    group_slug: string;
    group_label: unknown;
    field_id: string | null;
    name: string | null;
    type: string | null;
    storage: string | null;
    filterable: boolean | null;
    label: unknown;
  }>(
    `SELECT g.id AS group_id, g.slug AS group_slug, g.label AS group_label,
            f.id AS field_id, f.name, f.type, f.storage, f.filterable, f.label
     FROM plugin_directory.field_groups g
     LEFT JOIN plugin_directory.fields f ON f.group_id = g.id
     WHERE g.community_id = $1
     ORDER BY g.sort_order, f.sort_order NULLS LAST`,
    [communityId]
  );
  const groups = new Map<string, OpsCatalogGroup>();
  const order: string[] = [];
  for (const row of result.rows) {
    if (!groups.has(row.group_id)) {
      order.push(row.group_id);
      groups.set(row.group_id, {
        id: row.group_id,
        slug: row.group_slug,
        label: parseLocalized(row.group_label),
        fields: [],
      });
    }
    if (!row.field_id || !row.name || !row.type || !row.storage) {
      continue;
    }
    groups.get(row.group_id)!.fields.push({
      id: row.field_id,
      name: row.name,
      type: row.type,
      storage: row.storage,
      locked: row.storage !== 'attributes' || row.group_slug !== 'custom',
      filterable: Boolean(row.filterable),
      label: parseLocalized(row.label),
    });
  }
  return order.map((id) => groups.get(id)!);
}

export async function ensureCustomGroup(communityId: string): Promise<string> {
  const existing = await query<{ id: string }>(
    `SELECT id FROM plugin_directory.field_groups WHERE community_id = $1 AND slug = 'custom'`,
    [communityId]
  );
  if (existing.rows[0]) {
    return existing.rows[0].id;
  }
  const inserted = await query<{ id: string }>(
    `INSERT INTO plugin_directory.field_groups (community_id, slug, label, description, sort_order, columns)
     VALUES ($1, 'custom', $2::jsonb, $3::jsonb, 90, 1)
     RETURNING id`,
    [
      communityId,
      JSON.stringify(localizedPair('Campos da comunidade', 'Community fields')),
      JSON.stringify(localizedPair('Perguntas extras desta rede.', 'Extra questions for this network.')),
    ]
  );
  return inserted.rows[0].id;
}

function slugifyName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function parseSelectOptions(raw: string): { value: string; label: LocalizedText }[] {
  const options: { value: string; label: LocalizedText }[] = [];
  for (const line of raw.split('\n')) {
    const parts = line.split('|').map((part) => part.trim());
    if (parts.length < 2 || !parts[0]) {
      continue;
    }
    options.push({
      value: slugifyName(parts[0]) || parts[0],
      label: localizedPair(parts[1] || parts[0], parts[2] || parts[1] || parts[0]),
    });
  }
  return options;
}

export async function createAttributeField(
  communityId: string,
  input: {
    name: string;
    type: string;
    labelPt: string;
    labelEn: string;
    optionsText?: string;
    filterable?: boolean;
  }
): Promise<OpsCatalogField> {
  const name = slugifyName(input.name);
  const type = input.type;
  if (!name) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  if (!(ATTRIBUTE_FIELD_TYPES as readonly string[]).includes(type)) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const labelPt = input.labelPt.trim();
  if (!labelPt) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const options = type === 'select' ? parseSelectOptions(input.optionsText || '') : [];
  if (type === 'select' && options.length === 0) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const clash = await query<{ n: number }>(
    `SELECT count(*)::int AS n
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE g.community_id = $1 AND f.name = $2`,
    [communityId, name]
  );
  if ((clash.rows[0]?.n ?? 0) > 0) {
    throw new CatalogWriteError('DUPLICATE_FIELD');
  }
  const groupId = await ensureCustomGroup(communityId);
  const filterable = type === 'boolean' || type === 'select' ? Boolean(input.filterable) : false;
  const inserted = await query<{
    id: string;
    name: string;
    type: string;
    storage: string;
    filterable: boolean;
    label: unknown;
  }>(
    `INSERT INTO plugin_directory.fields (
       group_id, name, type, label, description, options, span, required, sort_order,
       storage, column_key, filterable, module_id
     ) VALUES (
       $1, $2, $3, $4::jsonb, '[]'::jsonb, $5::jsonb, 1, false,
       (SELECT coalesce(max(sort_order), 0) + 10 FROM plugin_directory.fields WHERE group_id = $1),
       'attributes', null, $6,
       (SELECT id FROM plugin_core.modules WHERE slug = 'directory')
     )
     RETURNING id, name, type, storage, filterable, label`,
    [groupId, name, type, JSON.stringify(localizedPair(labelPt, input.labelEn.trim() || labelPt)), JSON.stringify(options), filterable]
  );
  const row = inserted.rows[0];
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    storage: row.storage,
    locked: false,
    filterable: row.filterable,
    label: parseLocalized(row.label),
  };
}

export async function deleteAttributeField(communityId: string, fieldId: string): Promise<void> {
  const found = await query<{ storage: string; slug: string }>(
    `SELECT f.storage, g.slug
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE f.id = $1 AND g.community_id = $2`,
    [fieldId, communityId]
  );
  const row = found.rows[0];
  if (!row) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  if (row.storage !== 'attributes' || row.slug !== 'custom') {
    throw new CatalogWriteError('LOCKED');
  }
  await query(`DELETE FROM plugin_directory.fields WHERE id = $1`, [fieldId]);
}

export function catalogLabel(label: LocalizedText, locale: string | undefined): string {
  return pickLocalizedText(label, locale);
}
