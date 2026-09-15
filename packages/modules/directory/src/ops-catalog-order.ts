import { query } from '@community/db';
import { CatalogWriteError, movedSequence, type MoveDirection } from './ops-catalog-shared';

async function persistGroupOrder(ids: string[]): Promise<void> {
  for (let index = 0; index < ids.length; index += 1) {
    await query(`UPDATE plugin_directory.field_groups SET sort_order = $2 WHERE id = $1`, [ids[index], (index + 1) * 10]);
  }
}

async function persistFieldOrder(ids: string[]): Promise<void> {
  for (let index = 0; index < ids.length; index += 1) {
    await query(`UPDATE plugin_directory.fields SET sort_order = $2 WHERE id = $1`, [ids[index], (index + 1) * 10]);
  }
}

export async function moveCatalogGroup(
  communityId: string,
  groupId: string,
  direction: MoveDirection
): Promise<void> {
  const result = await query<{ id: string }>(
    `SELECT id FROM plugin_directory.field_groups WHERE community_id = $1 ORDER BY sort_order, id`,
    [communityId]
  );
  const ids = result.rows.map((row) => row.id);
  if (!ids.includes(groupId)) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  const next = movedSequence(ids, groupId, direction);
  if (!next) {
    return;
  }
  await persistGroupOrder(next);
}

export async function moveCatalogField(
  communityId: string,
  fieldId: string,
  direction: MoveDirection
): Promise<void> {
  const found = await query<{ group_id: string }>(
    `SELECT f.group_id
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE f.id = $1 AND g.community_id = $2`,
    [fieldId, communityId]
  );
  const groupId = found.rows[0]?.group_id;
  if (!groupId) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  const result = await query<{ id: string }>(
    `SELECT id FROM plugin_directory.fields WHERE group_id = $1 ORDER BY sort_order, id`,
    [groupId]
  );
  const next = movedSequence(
    result.rows.map((row) => row.id),
    fieldId,
    direction
  );
  if (!next) {
    return;
  }
  await persistFieldOrder(next);
}

export async function moveCatalogFieldToGroup(
  communityId: string,
  fieldId: string,
  groupId: string
): Promise<void> {
  const found = await query<{ group_id: string }>(
    `SELECT f.group_id
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE f.id = $1 AND g.community_id = $2`,
    [fieldId, communityId]
  );
  if (!found.rows[0]) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  if (found.rows[0].group_id === groupId) {
    return;
  }
  const dest = await query<{ id: string }>(
    `SELECT id FROM plugin_directory.field_groups WHERE id = $1 AND community_id = $2`,
    [groupId, communityId]
  );
  if (!dest.rows[0]) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  await query(
    `UPDATE plugin_directory.fields
     SET group_id = $2,
         sort_order = (SELECT coalesce(max(sort_order), 0) + 10 FROM plugin_directory.fields WHERE group_id = $2)
     WHERE id = $1`,
    [fieldId, groupId]
  );
}

const SEED_GROUP_ORDER = [
  'identity',
  'community_copy',
  'person',
  'links',
  'availability',
  'hospitality',
  'custom',
] as const;

const SEED_FIELD_ORDER: Record<string, number> = {
  full_name: 10,
  avatar_url: 20,
  headline: 10,
  bio: 20,
  gender: 10,
  birth_city: 20,
  current_city: 30,
  languages: 40,
  linkedin: 10,
  github: 20,
  portfolio: 30,
  availability_status: 10,
  public_showcase: 20,
  host_at_home: 10,
};

function seedGroupRank(slug: string): number {
  const index = SEED_GROUP_ORDER.indexOf(slug as (typeof SEED_GROUP_ORDER)[number]);
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}

function seedFieldRank(name: string): number {
  return SEED_FIELD_ORDER[name] ?? Number.MAX_SAFE_INTEGER;
}

export async function resetCatalogOrder(communityId: string): Promise<void> {
  const groups = await query<{ id: string; slug: string }>(
    `SELECT id, slug FROM plugin_directory.field_groups WHERE community_id = $1 ORDER BY sort_order, id`,
    [communityId]
  );
  if (!groups.rows.length) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  const rankedGroups = [...groups.rows].sort((left, right) => seedGroupRank(left.slug) - seedGroupRank(right.slug));
  await persistGroupOrder(rankedGroups.map((row) => row.id));
  for (const group of groups.rows) {
    const fields = await query<{ id: string; name: string }>(
      `SELECT id, name FROM plugin_directory.fields WHERE group_id = $1 ORDER BY sort_order, id`,
      [group.id]
    );
    const rankedFields = [...fields.rows].sort((left, right) => seedFieldRank(left.name) - seedFieldRank(right.name));
    await persistFieldOrder(rankedFields.map((row) => row.id));
  }
}
