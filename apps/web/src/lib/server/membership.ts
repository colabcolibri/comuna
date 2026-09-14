import { query } from '@community/db';
import { createIsEnabled } from '@community/module-runtime';

export const moduleRuntime = createIsEnabled({ query });

export async function activeMembership(userId: string) {
  const result = await query<{ id: string; community_id: string }>(
    `SELECT id, community_id
     FROM network_core.memberships
     WHERE user_id = $1 AND network_status = 'active'
     ORDER BY joined_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] ?? null;
}
