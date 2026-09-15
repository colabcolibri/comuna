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

export async function viewerCommunityId(userId?: string | null) {
  if (userId) {
    const membership = await activeMembership(userId);
    if (membership) {
      return membership.community_id;
    }
  }
  const publicCommunity = await query<{ id: string }>(
    `SELECT id FROM network_core.communities
     ORDER BY is_public_showcase DESC, created_at
     LIMIT 1`
  );
  return publicCommunity.rows[0]?.id ?? null;
}

export async function viewerEnabledSlugs(userId?: string | null) {
  const communityId = await viewerCommunityId(userId);
  if (!communityId) {
    return [];
  }
  return moduleRuntime.listEnabled(communityId);
}
