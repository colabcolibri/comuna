import { query } from '@community/db';
import { parseLocalized, type LocalizedText } from '@community/identity';
import { CatalogWriteError, fieldCanFilter } from './ops-catalog-shared';
import {
  identityPlacementLocked,
  parseListKey,
  parseListPlacement,
  showcaseFieldForbidden,
  type ListKey,
  type ListPlacement,
} from './list-fields';

export type OpsListField = {
  fieldId: string;
  name: string;
  type: string;
  label: LocalizedText;
  canFilter: boolean;
  filterable: boolean;
  placement: ListPlacement;
  placementLocked: boolean;
  forbidden: boolean;
};

function normalizePolicy(
  listKey: ListKey,
  field: { name: string; column_key: string | null; type: string },
  filterable: boolean,
  placement: ListPlacement
): { filterable: boolean; placement: ListPlacement } {
  if (listKey === 'showcase' && showcaseFieldForbidden(field)) {
    return { filterable: false, placement: 'off' };
  }
  if (identityPlacementLocked(field)) {
    return { filterable: false, placement: 'card' };
  }
  return {
    filterable: fieldCanFilter(field.type) ? filterable : false,
    placement,
  };
}

export async function listOpsListFields(communityId: string, rawKey: unknown): Promise<OpsListField[]> {
  const listKey = parseListKey(rawKey);
  if (!listKey) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const result = await query<{
    id: string;
    name: string;
    type: string;
    column_key: string | null;
    label: unknown;
    filterable: boolean;
    placement: string;
  }>(
    `SELECT f.id, f.name, f.type, f.column_key, f.label, lf.filterable, lf.placement
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     JOIN plugin_directory.list_fields lf ON lf.field_id = f.id AND lf.list_key = $2
     WHERE g.community_id = $1 AND f.enabled AND g.enabled
     ORDER BY g.sort_order, f.sort_order`,
    [communityId, listKey]
  );
  return result.rows.map((row) => {
    const field = { name: row.name, column_key: row.column_key, type: row.type };
    const forbidden = listKey === 'showcase' && showcaseFieldForbidden(field);
    return {
      fieldId: row.id,
      name: row.name,
      type: row.type,
      label: parseLocalized(row.label),
      canFilter: fieldCanFilter(row.type) && !forbidden && !identityPlacementLocked(field),
      filterable: row.filterable,
      placement: parseListPlacement(row.placement),
      placementLocked: identityPlacementLocked(field) || forbidden,
      forbidden,
    };
  });
}

export async function saveOpsListFields(
  communityId: string,
  rawKey: unknown,
  rawFields: unknown
): Promise<void> {
  const listKey = parseListKey(rawKey);
  if (!listKey || !Array.isArray(rawFields)) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const current = await query<{ id: string; name: string; type: string; column_key: string | null }>(
    `SELECT f.id, f.name, f.type, f.column_key
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE g.community_id = $1`,
    [communityId]
  );
  const byId = new Map(current.rows.map((row) => [row.id, row]));
  for (const item of rawFields) {
    if (!item || typeof item !== 'object') {
      throw new CatalogWriteError('VALIDATION_ERROR');
    }
    const row = item as { fieldId?: unknown; filterable?: unknown; placement?: unknown };
    const fieldId = String(row.fieldId || '');
    const field = byId.get(fieldId);
    if (!field) {
      throw new CatalogWriteError('NOT_FOUND');
    }
    if (typeof row.filterable !== 'boolean') {
      throw new CatalogWriteError('VALIDATION_ERROR');
    }
    if (!['off', 'detail', 'card'].includes(String(row.placement || ''))) {
      throw new CatalogWriteError('VALIDATION_ERROR');
    }
    const placement = parseListPlacement(row.placement);
    const next = normalizePolicy(listKey, field, row.filterable, placement);
    await query(
      `INSERT INTO plugin_directory.list_fields (field_id, list_key, filterable, placement)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (field_id, list_key) DO UPDATE SET
         filterable = EXCLUDED.filterable,
         placement = EXCLUDED.placement`,
      [fieldId, listKey, next.filterable, next.placement]
    );
  }
}
