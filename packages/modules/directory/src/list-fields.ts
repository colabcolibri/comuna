import { parseField, type CatalogField } from './catalog';

export const LIST_KEYS = ['directory', 'showcase'] as const;
export type ListKey = (typeof LIST_KEYS)[number];

export const LIST_PLACEMENTS = ['off', 'detail', 'card'] as const;
export type ListPlacement = (typeof LIST_PLACEMENTS)[number];

export type ListDensity = 'card' | 'detail';

export type ListField = CatalogField & {
  filterable: boolean;
  placement: ListPlacement;
};

export const SHOWCASE_FORBIDDEN_KEYS = new Set(['gender', 'birth_city', 'public_showcase']);
export const IDENTITY_LOCKED_NAMES = new Set(['full_name', 'avatar_url']);

export function parseListKey(raw: unknown): ListKey | null {
  const value = String(raw || '');
  return (LIST_KEYS as readonly string[]).includes(value) ? (value as ListKey) : null;
}

export function parseListPlacement(raw: unknown): ListPlacement {
  const value = String(raw || '');
  return (LIST_PLACEMENTS as readonly string[]).includes(value) ? (value as ListPlacement) : 'off';
}

export function parseListField(row: Record<string, unknown>): ListField | null {
  const field = parseField(row);
  if (!field) {
    return null;
  }
  return {
    ...field,
    filterable: Boolean(row.filterable),
    placement: parseListPlacement(row.placement),
  };
}

export function parseListFields(rows: unknown[]): ListField[] {
  return rows
    .map((row) => (row && typeof row === 'object' ? parseListField(row as Record<string, unknown>) : null))
    .filter((field): field is ListField => Boolean(field));
}

export function visibleOn(placement: ListPlacement, density: ListDensity): boolean {
  if (placement === 'off') {
    return false;
  }
  if (density === 'card') {
    return placement === 'card';
  }
  return true;
}

export function listedAttributeNames(fields: ListField[]): string[] {
  return fields.filter((field) => field.storage === 'attributes' && field.placement !== 'off').map((field) => field.name);
}

export function attributeFacets(fields: ListField[]): ListField[] {
  return fields.filter((field) => field.filterable && field.storage === 'attributes');
}

export const PERSON_VIEW_SLOTS = new Set([
  'full_name',
  'avatar_url',
  'current_city',
  'languages',
  'headline',
  'bio',
  'availability_status',
  'public_showcase',
]);

export function isPersonViewSlot(field: { name: string; column_key: string | null }): boolean {
  const key = field.column_key || field.name;
  return PERSON_VIEW_SLOTS.has(key) || key.startsWith('contacts.');
}

export function availabilityIsFilterable(fields: ListField[]): boolean {
  return fields.some(
    (field) => (field.column_key === 'availability_status' || field.name === 'availability_status') && field.filterable
  );
}

export function showcaseFieldForbidden(field: { name: string; column_key: string | null }): boolean {
  return SHOWCASE_FORBIDDEN_KEYS.has(field.column_key || field.name);
}

export function identityPlacementLocked(field: { name: string; column_key: string | null }): boolean {
  return IDENTITY_LOCKED_NAMES.has(field.name) || IDENTITY_LOCKED_NAMES.has(field.column_key || '');
}

export const LIST_FIELDS_SQL = `SELECT f.name, f.type, f.options, f.storage, f.column_key, f.required, f.span, f.sort_order, f.label, f.enabled, f.description,
       lf.filterable, lf.placement
 FROM plugin_directory.fields f
 JOIN plugin_directory.field_groups g ON g.id = f.group_id
 JOIN plugin_directory.list_fields lf ON lf.field_id = f.id AND lf.list_key = $2
 WHERE g.community_id = $1 AND g.enabled AND f.enabled
 ORDER BY g.sort_order, f.sort_order`;
