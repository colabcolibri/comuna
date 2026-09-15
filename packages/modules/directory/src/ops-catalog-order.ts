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
