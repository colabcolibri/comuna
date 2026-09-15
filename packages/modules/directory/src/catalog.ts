import { parseLocalized, type LocalizedText } from '@community/identity';

export const FIELD_TYPES = [
  'text',
  'textarea',
  'localized_text',
  'select',
  'radio',
  'checkbox',
  'boolean',
  'city',
  'url',
  'image',
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const STORAGE_KINDS = ['person', 'card_column', 'attributes'] as const;
export type StorageKind = (typeof STORAGE_KINDS)[number];

export type FieldOption = {
  value: string;
  label: LocalizedText;
};

export type CatalogField = {
  name: string;
  type: FieldType;
  label: LocalizedText;
  description: LocalizedText;
  options: FieldOption[];
  span: 1 | 2 | 3;
  required: boolean;
  sort_order: number;
  storage: StorageKind;
  column_key: string | null;
  filterable: boolean;
  module_slug: string | null;
};

export function visibleCatalog(groups: CatalogGroup[], enabled: Iterable<string>): CatalogGroup[] {
  const on = new Set(enabled);
  return groups
    .map((group) => ({
      ...group,
      fields: group.fields.filter((field) => !field.module_slug || on.has(field.module_slug)),
    }))
    .filter((group) => group.fields.length > 0);
}

export type CatalogGroup = {
  slug: string;
  label: LocalizedText;
  description: LocalizedText;
  sort_order: number;
  columns: 1 | 2 | 3;
  fields: CatalogField[];
};

function asSpan(raw: unknown): 1 | 2 | 3 {
  const n = Number(raw);
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
}

function parseOptions(raw: unknown): FieldOption[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: FieldOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const value = String((item as { value?: unknown }).value || '').trim();
    if (!value) {
      continue;
    }
    out.push({
      value,
      label: parseLocalized((item as { label?: unknown }).label),
    });
  }
  return out;
}

export function parseField(row: Record<string, unknown>): CatalogField | null {
  const name = String(row.name || '').trim();
  const type = String(row.type || '');
  const storage = String(row.storage || '');
  if (!name || !(FIELD_TYPES as readonly string[]).includes(type)) {
    return null;
  }
  if (!(STORAGE_KINDS as readonly string[]).includes(storage)) {
    return null;
  }
  const columnKey = row.column_key == null || row.column_key === '' ? null : String(row.column_key);
  const moduleSlug = row.module_slug == null || row.module_slug === '' ? null : String(row.module_slug);
  return {
    name,
    type: type as FieldType,
    label: parseLocalized(row.label),
    description: parseLocalized(row.description),
    options: parseOptions(row.options),
    span: asSpan(row.span),
    required: Boolean(row.required),
    sort_order: Number(row.sort_order) || 0,
    storage: storage as StorageKind,
    column_key: columnKey,
    filterable: Boolean(row.filterable),
    module_slug: moduleSlug,
  };
}

export function nestCatalog(rows: Record<string, unknown>[]): CatalogGroup[] {
  const groups = new Map<string, CatalogGroup>();
  const order: string[] = [];
  for (const row of rows) {
    const slug = String(row.group_slug || row.slug || '').trim();
    if (!slug) {
      continue;
    }
    if (!groups.has(slug)) {
      order.push(slug);
      groups.set(slug, {
        slug,
        label: parseLocalized(row.group_label),
        description: parseLocalized(row.group_description),
        sort_order: Number(row.group_sort_order ?? row.sort_order) || 0,
        columns: asSpan(row.columns),
        fields: [],
      });
    }
    const field = parseField(row);
    if (field) {
      groups.get(slug)!.fields.push(field);
    }
  }
  return order.map((slug) => groups.get(slug)!);
}

export function validateCustomAttributes(
  fields: CatalogField[],
  raw: unknown
): { ok: true; value: Record<string, unknown> } | { ok: false; message: string } {
  const allowed = fields.filter((field) => field.storage === 'attributes');
  const names = new Set(allowed.map((field) => field.name));
  const input = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  for (const key of Object.keys(input)) {
    if (!names.has(key)) {
      return { ok: false, message: `Campo desconhecido: ${key}` };
    }
  }
  const value: Record<string, unknown> = {};
  for (const field of allowed) {
    if (!(field.name in input)) {
      continue;
    }
    const parsed = coerceAttribute(field, input[field.name]);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message };
    }
    if (parsed.value !== undefined) {
      value[field.name] = parsed.value;
    }
  }
  return { ok: true, value };
}

function coerceAttribute(
  field: CatalogField,
  raw: unknown
): { ok: true; value?: unknown } | { ok: false; message: string } {
  if (field.type === 'boolean') {
    if (raw === true || raw === false) {
      return { ok: true, value: raw };
    }
    return { ok: false, message: `${field.name} deve ser boolean` };
  }
  if (field.type === 'checkbox') {
    if (!Array.isArray(raw)) {
      return { ok: false, message: `${field.name} deve ser lista` };
    }
    const allowed = new Set(field.options.map((item) => item.value));
    const values = raw.map((item) => String(item)).filter((item) => allowed.has(item));
    return { ok: true, value: values };
  }
  if (field.type === 'select' || field.type === 'radio') {
    const value = String(raw ?? '').trim();
    if (!value) {
      return { ok: true, value: undefined };
    }
    if (!field.options.some((item) => item.value === value)) {
      return { ok: false, message: `${field.name} opção inválida` };
    }
    return { ok: true, value };
  }
  if (typeof raw === 'string') {
    const value = raw.trim();
    return { ok: true, value: value || undefined };
  }
  return { ok: false, message: `${field.name} tipo inválido` };
}

export function parseAttrFilters(
  params: URLSearchParams,
  fields: CatalogField[]
): { ok: true; filters: Record<string, unknown>[] } | { ok: false; message: string } {
  const filterable = new Map(
    fields.filter((field) => field.storage === 'attributes' && field.filterable).map((field) => [field.name, field])
  );
  const filters: Record<string, unknown>[] = [];
  for (const [key, raw] of params.entries()) {
    if (!key.startsWith('attr.')) {
      continue;
    }
    const name = key.slice(5);
    const field = filterable.get(name);
    if (!field) {
      return { ok: false, message: `Facet inválido: ${name}` };
    }
    const coerced = coerceAttribute(field, field.type === 'boolean' ? raw === 'true' : raw);
    if (!coerced.ok) {
      return { ok: false, message: coerced.message };
    }
    if (coerced.value === undefined) {
      continue;
    }
    filters.push({ [name]: coerced.value });
  }
  return { ok: true, filters };
}

export const CORE_GROUP_SLUGS = ['identity', 'person'] as const;
