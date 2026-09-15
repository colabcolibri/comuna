import { query } from '@community/db';
import { localizedPair, parseLocalized, type LocalizedText } from '@community/identity';
import {
  ATTRIBUTE_FIELD_TYPES,
  CatalogWriteError,
  isFieldLocked,
  slugifyCatalogName,
} from './ops-catalog-shared';

export type OpsCatalogField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  locked: boolean;
  filterable: boolean;
  label: LocalizedText;
};

function parseSelectOptions(raw: string): { value: string; label: LocalizedText }[] {
  const options: { value: string; label: LocalizedText }[] = [];
  for (const line of raw.split('\n')) {
    const parts = line.split('|').map((part) => part.trim());
    if (parts.length < 2 || !parts[0]) {
      continue;
    }
    options.push({
      value: slugifyCatalogName(parts[0]) || parts[0],
      label: localizedPair(parts[1] || parts[0], parts[2] || parts[1] || parts[0]),
    });
  }
  return options;
}

export async function createAttributeField(
  communityId: string,
  input: {
    groupId: string;
    name: string;
    type: string;
    labelPt: string;
    labelEn: string;
    optionsText?: string;
    filterable?: boolean;
  }
): Promise<OpsCatalogField> {
  if (!input.groupId) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const name = slugifyCatalogName(input.name);
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
  const group = await query<{ id: string }>(
    `SELECT id FROM plugin_directory.field_groups WHERE id = $1 AND community_id = $2`,
    [input.groupId, communityId]
  );
  if (!group.rows[0]) {
    throw new CatalogWriteError('NOT_FOUND');
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
    [
      input.groupId,
      name,
      type,
      JSON.stringify(localizedPair(labelPt, input.labelEn.trim() || labelPt)),
      JSON.stringify(options),
      filterable,
    ]
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
  const found = await query<{ storage: string }>(
    `SELECT f.storage
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE f.id = $1 AND g.community_id = $2`,
    [fieldId, communityId]
  );
  const row = found.rows[0];
  if (!row) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  if (isFieldLocked(row.storage)) {
    throw new CatalogWriteError('LOCKED');
  }
  await query(`DELETE FROM plugin_directory.fields WHERE id = $1`, [fieldId]);
}
