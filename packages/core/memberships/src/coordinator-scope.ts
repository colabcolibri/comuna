import { query } from '@community/db';

export async function listCoordinatorCommunityIds(userId: string): Promise<string[]> {
  const result = await query<{ community_id: string }>(
    `SELECT community_id
     FROM network_core.memberships
     WHERE user_id = $1
       AND network_role = 'coordinator'
       AND network_status = 'active'`,
    [userId]
  );
  return result.rows.map((row) => row.community_id);
}

export async function canAccessOpsPortal(userId: string, globalRole: string): Promise<boolean> {
  if (globalRole === 'super_admin') {
    return true;
  }
  const ids = await listCoordinatorCommunityIds(userId);
  return ids.length > 0;
}

export async function membershipCommunityId(membershipId: string): Promise<string | null> {
  const result = await query<{ community_id: string }>(
    `SELECT community_id FROM network_core.memberships WHERE id = $1`,
    [membershipId]
  );
  return result.rows[0]?.community_id ?? null;
}
