import { query } from '@community/db';
import { localizedPair, parseLocalized, pickLocalizedText, type LocalizedText } from '@community/identity';
import {
  ATTRIBUTE_FIELD_TYPES,
  CatalogWriteError,
  fieldCanFilter,
  fieldNeedsOptions,
  isFieldLocked,
  parseCatalogSpan,
  slugifyCatalogName,
} from './ops-catalog-shared';

export type OpsCatalogField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  locked: boolean;
  filterable: boolean;
  span: 1 | 2 | 3;
  optionsText: string;
  label: LocalizedText;
};

export function optionsToText(raw: unknown): string {
  if (!Array.isArray(raw)) {
    return '';
  }
  const lines: string[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const row = item as { value?: unknown; label?: unknown };
    const value = String(row.value || '').trim();
    if (!value) {
      continue;
    }
    const label = parseLocalized(row.label);
    const pt = pickLocalizedText(label, 'pt-BR') || value;
    const en = pickLocalizedText(label, 'en') || pt;
    lines.push(`${value}|${pt}|${en}`);
  }
  return lines.join('\n');
}

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
    span?: number;
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
  const options = fieldNeedsOptions(type) ? parseSelectOptions(input.optionsText || '') : [];
  if (fieldNeedsOptions(type) && options.length === 0) {
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
  const filterable = fieldCanFilter(type) ? Boolean(input.filterable) : false;
  const span = parseCatalogSpan(input.span, 1);
  const inserted = await query<{
    id: string;
    name: string;
    type: string;
    storage: string;
    filterable: boolean;
    span: number;
    options: unknown;
    label: unknown;
  }>(
    `INSERT INTO plugin_directory.fields (
       group_id, name, type, label, description, options, span, required, sort_order,
       storage, column_key, filterable, module_id
     ) VALUES (
       $1, $2, $3, $4::jsonb, '[]'::jsonb, $5::jsonb, $7, false,
       (SELECT coalesce(max(sort_order), 0) + 10 FROM plugin_directory.fields WHERE group_id = $1),
       'attributes', null, $6,
       (SELECT id FROM plugin_core.modules WHERE slug = 'directory')
     )
     RETURNING id, name, type, storage, filterable, span, options, label`,
    [
      input.groupId,
      name,
      type,
      JSON.stringify(localizedPair(labelPt, input.labelEn.trim() || labelPt)),
      JSON.stringify(options),
      filterable,
      span,
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
    span: parseCatalogSpan(row.span, 1),
    optionsText: optionsToText(row.options),
    label: parseLocalized(row.label),
  };
}

export async function updateOpsField(
  communityId: string,
  fieldId: string,
  input: { labelPt?: string; labelEn?: string; optionsText?: string; filterable?: boolean; span?: number }
): Promise<void> {
  const found = await query<{ storage: string; type: string }>(
    `SELECT f.storage, f.type
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE f.id = $1 AND g.community_id = $2`,
    [fieldId, communityId]
  );
  const row = found.rows[0];
  if (!row) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  const span = parseCatalogSpan(input.span, 1);
  if (isFieldLocked(row.storage)) {
    await query(`UPDATE plugin_directory.fields SET span = $2 WHERE id = $1`, [fieldId, span]);
    return;
  }
  const labelPt = (input.labelPt || '').trim();
  if (!labelPt) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const options = fieldNeedsOptions(row.type) ? parseSelectOptions(input.optionsText || '') : [];
  if (fieldNeedsOptions(row.type) && options.length === 0) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const filterable = fieldCanFilter(row.type) ? Boolean(input.filterable) : false;
  await query(
    `UPDATE plugin_directory.fields
     SET label = $2::jsonb, options = $3::jsonb, filterable = $4, span = $5
     WHERE id = $1`,
    [
      fieldId,
      JSON.stringify(localizedPair(labelPt, (input.labelEn || '').trim() || labelPt)),
      JSON.stringify(options),
      filterable,
      span,
    ]
  );
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
