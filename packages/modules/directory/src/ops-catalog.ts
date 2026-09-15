import { query } from '@community/db';
import { localizedPair, parseLocalized, pickLocalizedText, type LocalizedText } from '@community/identity';
import { isFieldLocked, isSeedGroup, parseCatalogSpan } from './ops-catalog-shared';
import { optionsToText, storedOptionsToOps, type OpsCatalogField } from './ops-catalog-fields';

export type OpsCatalogGroup = {
  id: string;
  slug: string;
  columns: number;
  locked: boolean;
  label: LocalizedText;
  fields: OpsCatalogField[];
};

export async function listOpsCatalog(communityId: string): Promise<OpsCatalogGroup[]> {
  const result = await query<{
    group_id: string;
    group_slug: string;
    group_label: unknown;
    group_columns: number;
    field_id: string | null;
    name: string | null;
    type: string | null;
    storage: string | null;
    filterable: boolean | null;
    span: number | null;
    required: boolean | null;
    options: unknown;
    label: unknown;
  }>(
    `SELECT g.id AS group_id, g.slug AS group_slug, g.label AS group_label, g.columns AS group_columns,
            f.id AS field_id, f.name, f.type, f.storage, f.filterable, f.span, f.required, f.options, f.label
     FROM plugin_directory.field_groups g
     LEFT JOIN plugin_directory.fields f ON f.group_id = g.id
     WHERE g.community_id = $1
     ORDER BY g.sort_order, g.id, f.sort_order NULLS LAST, f.id`,
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
        columns: row.group_columns,
        locked: isSeedGroup(row.group_slug),
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
      locked: isFieldLocked(row.storage),
      filterable: Boolean(row.filterable),
      span: parseCatalogSpan(row.span, 1),
      required: Boolean(row.required),
      options: storedOptionsToOps(row.options),
      optionsText: optionsToText(row.options),
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
      JSON.stringify([]),
    ]
  );
  return inserted.rows[0].id;
}

export function catalogLabel(label: LocalizedText, locale: string | undefined): string {
  return pickLocalizedText(label, locale);
}
