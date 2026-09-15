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

export type OpsChoiceOption = {
  value: string;
  labelPt: string;
  labelEn: string;
};

export type OpsCatalogField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  locked: boolean;
  filterable: boolean;
  span: 1 | 2 | 3;
  required: boolean;
  options: OpsChoiceOption[];
  optionsText: string;
  label: LocalizedText;
};

export function storedOptionsToOps(raw: unknown): OpsChoiceOption[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: OpsChoiceOption[] = [];
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
    const labelPt = pickLocalizedText(label, 'pt-BR') || value;
    const labelEn = pickLocalizedText(label, 'en') || labelPt;
    out.push({ value, labelPt, labelEn });
  }
  return out;
}

export function optionsToText(raw: unknown): string {
  return storedOptionsToOps(raw)
    .map((item) => `${item.value}|${item.labelPt}|${item.labelEn}`)
    .join('\n');
}

function uniqueChoiceOptions(options: { value: string; label: LocalizedText }[]) {
  const values = options.map((item) => item.value);
  if (new Set(values).size !== values.length) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  return options;
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
  return uniqueChoiceOptions(options);
}

function parseChoiceArray(raw: unknown[]): { value: string; label: LocalizedText }[] {
  const options: { value: string; label: LocalizedText }[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const row = item as { value?: unknown; labelPt?: unknown; labelEn?: unknown; label?: unknown };
    const rawValue = String(row.value || '').trim();
    const value = slugifyCatalogName(rawValue) || rawValue;
    if (!value) {
      continue;
    }
    let labelPt = String(row.labelPt || '').trim();
    let labelEn = String(row.labelEn || '').trim();
    if (!labelPt && row.label != null) {
      const localized = parseLocalized(row.label);
      labelPt = pickLocalizedText(localized, 'pt-BR');
      labelEn = pickLocalizedText(localized, 'en');
    }
    options.push({
      value,
      label: localizedPair(labelPt || value, labelEn || labelPt || value),
    });
  }
  return uniqueChoiceOptions(options);
}

export function normalizeOpsChoiceOptions(input: {
  options?: unknown;
  optionsText?: string;
}): { value: string; label: LocalizedText }[] {
  if (input.options !== undefined) {
    if (!Array.isArray(input.options)) {
      throw new CatalogWriteError('VALIDATION_ERROR');
    }
    return parseChoiceArray(input.options);
  }
  return parseSelectOptions(input.optionsText || '');
}

function asOpsField(row: {
  id: string;
  name: string;
  type: string;
  storage: string;
  filterable: boolean;
  span: number;
  required: boolean;
  options: unknown;
  label: unknown;
}): OpsCatalogField {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    storage: row.storage,
    locked: isFieldLocked(row.storage),
    filterable: row.filterable,
    span: parseCatalogSpan(row.span, 1),
    required: Boolean(row.required),
    options: storedOptionsToOps(row.options),
    optionsText: optionsToText(row.options),
    label: parseLocalized(row.label),
  };
}

export async function createAttributeField(
  communityId: string,
  input: {
    groupId: string;
    name: string;
    type: string;
    labelPt: string;
    labelEn: string;
    options?: unknown;
    optionsText?: string;
    filterable?: boolean;
    span?: number;
    required?: boolean;
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
  const options = fieldNeedsOptions(type)
    ? normalizeOpsChoiceOptions({ options: input.options, optionsText: input.optionsText })
    : [];
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
    required: boolean;
    options: unknown;
    label: unknown;
  }>(
    `INSERT INTO plugin_directory.fields (
       group_id, name, type, label, description, options, span, required, sort_order,
       storage, column_key, filterable, module_id
     ) VALUES (
       $1, $2, $3, $4::jsonb, '[]'::jsonb, $5::jsonb, $7, $8,
       (SELECT coalesce(max(sort_order), 0) + 10 FROM plugin_directory.fields WHERE group_id = $1),
       'attributes', null, $6,
       (SELECT id FROM plugin_core.modules WHERE slug = 'directory')
     )
     RETURNING id, name, type, storage, filterable, span, required, options, label`,
    [
      input.groupId,
      name,
      type,
      JSON.stringify(localizedPair(labelPt, input.labelEn.trim() || labelPt)),
      JSON.stringify(options),
      filterable,
      span,
      Boolean(input.required),
    ]
  );
  return asOpsField(inserted.rows[0]);
}

export async function updateCatalogFieldSpan(
  communityId: string,
  fieldId: string,
  span: unknown
): Promise<void> {
  const next = parseCatalogSpan(span);
  const found = await query<{ id: string }>(
    `SELECT f.id
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE f.id = $1 AND g.community_id = $2`,
    [fieldId, communityId]
  );
  if (!found.rows[0]) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  await query(`UPDATE plugin_directory.fields SET span = $2 WHERE id = $1`, [fieldId, next]);
}

export async function updateCatalogFieldRequired(
  communityId: string,
  fieldId: string,
  required: unknown
): Promise<void> {
  if (typeof required !== 'boolean') {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const found = await query<{ id: string }>(
    `SELECT f.id
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE f.id = $1 AND g.community_id = $2`,
    [fieldId, communityId]
  );
  if (!found.rows[0]) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  await query(`UPDATE plugin_directory.fields SET required = $2 WHERE id = $1`, [fieldId, required]);
}

export async function updateOpsField(
  communityId: string,
  fieldId: string,
  input: { labelPt?: string; labelEn?: string; options?: unknown; optionsText?: string; filterable?: boolean }
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
  if (isFieldLocked(row.storage)) {
    throw new CatalogWriteError('LOCKED');
  }
  const labelPt = (input.labelPt || '').trim();
  if (!labelPt) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const options = fieldNeedsOptions(row.type)
    ? normalizeOpsChoiceOptions({ options: input.options, optionsText: input.optionsText })
    : [];
  if (fieldNeedsOptions(row.type) && options.length === 0) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const filterable = fieldCanFilter(row.type) ? Boolean(input.filterable) : false;
  await query(
    `UPDATE plugin_directory.fields
     SET label = $2::jsonb, options = $3::jsonb, filterable = $4
     WHERE id = $1`,
    [fieldId, JSON.stringify(localizedPair(labelPt, (input.labelEn || '').trim() || labelPt)), JSON.stringify(options), filterable]
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
