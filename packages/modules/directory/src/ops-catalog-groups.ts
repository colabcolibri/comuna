import { query } from '@community/db';
import { localizedPair, parseLocalized, type LocalizedText } from '@community/identity';
import { CatalogWriteError, isSeedGroup, parseCatalogColumns, slugifyCatalogName } from './ops-catalog-shared';

export type OpsCatalogGroupRecord = {
  id: string;
  slug: string;
  columns: number;
  locked: boolean;
  label: LocalizedText;
};

export async function createCatalogGroup(
  communityId: string,
  input: { slug?: string; labelPt: string; labelEn: string; columns?: number }
): Promise<OpsCatalogGroupRecord> {
  const labelPt = input.labelPt.trim();
  if (!labelPt) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const slug = slugifyCatalogName(input.slug || labelPt);
  if (!slug) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const columns = parseCatalogColumns(input.columns, 1);
  try {
    const inserted = await query<{ id: string; slug: string; columns: number; label: unknown }>(
      `INSERT INTO plugin_directory.field_groups (community_id, slug, label, description, sort_order, columns)
       VALUES (
         $1, $2, $3::jsonb, '[]'::jsonb,
         (SELECT coalesce(max(sort_order), 0) + 10 FROM plugin_directory.field_groups WHERE community_id = $1),
         $4
       )
       RETURNING id, slug, columns, label`,
      [communityId, slug, JSON.stringify(localizedPair(labelPt, input.labelEn.trim() || labelPt)), columns]
    );
    const row = inserted.rows[0];
    return {
      id: row.id,
      slug: row.slug,
      columns: row.columns,
      locked: false,
      label: parseLocalized(row.label),
    };
  } catch (err) {
    const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: string }).code) : '';
    if (code === '23505') {
      throw new CatalogWriteError('DUPLICATE_GROUP');
    }
    throw err;
  }
}

export async function updateCatalogGroup(
  communityId: string,
  groupId: string,
  input: { columns?: unknown; labelPt?: unknown; labelEn?: unknown; enabled?: unknown }
): Promise<void> {
  const patches: string[] = [];
  const params: unknown[] = [groupId, communityId];
  if (input.columns !== undefined) {
    params.push(parseCatalogColumns(input.columns));
    patches.push(`columns = $${params.length}`);
  }
  const labelPt = typeof input.labelPt === 'string' ? input.labelPt.trim() : '';
  if (labelPt) {
    const labelEn = typeof input.labelEn === 'string' ? input.labelEn.trim() : labelPt;
    params.push(JSON.stringify(localizedPair(labelPt, labelEn || labelPt)));
    patches.push(`label = $${params.length}::jsonb`);
  }
  if (typeof input.enabled === 'boolean') {
    params.push(input.enabled);
    patches.push(`enabled = $${params.length}`);
  }
  if (!patches.length) {
    throw new CatalogWriteError('VALIDATION_ERROR');
  }
  const found = await query<{ id: string }>(
    `SELECT id FROM plugin_directory.field_groups WHERE id = $1 AND community_id = $2`,
    [groupId, communityId]
  );
  if (!found.rows[0]) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  await query(
    `UPDATE plugin_directory.field_groups SET ${patches.join(', ')} WHERE id = $1 AND community_id = $2`,
    params
  );
}

export async function updateCatalogGroupColumns(
  communityId: string,
  groupId: string,
  columns: unknown
): Promise<void> {
  await updateCatalogGroup(communityId, groupId, { columns });
}

export async function deleteCatalogGroup(communityId: string, groupId: string): Promise<void> {
  const found = await query<{ slug: string; n: number; enabled: boolean }>(
    `SELECT g.slug, g.enabled, count(f.id)::int AS n
     FROM plugin_directory.field_groups g
     LEFT JOIN plugin_directory.fields f ON f.group_id = g.id
     WHERE g.id = $1 AND g.community_id = $2
     GROUP BY g.slug, g.enabled`,
    [groupId, communityId]
  );
  const row = found.rows[0];
  if (!row) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  if (isSeedGroup(row.slug)) {
    throw new CatalogWriteError('LOCKED');
  }
  if (row.enabled) {
    throw new CatalogWriteError('ACTIVE');
  }
  if (row.n > 0) {
    throw new CatalogWriteError('GROUP_NOT_EMPTY');
  }
  await query(`DELETE FROM plugin_directory.field_groups WHERE id = $1`, [groupId]);
}
