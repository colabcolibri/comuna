import { queryAsMember, type AppQueryContext } from '@community/db';
import {
  DuplicateMembershipError,
  InvalidNetworkStatusError,
  type NetworkRole,
  type NetworkStatus,
} from './memberships';

export type JoinSeat = {
  id: string;
  network_role: NetworkRole;
  network_status: NetworkStatus;
};

export class JoinNotAllowedError extends Error {
  constructor() {
    super('JOIN_NOT_ALLOWED');
    this.name = 'JoinNotAllowedError';
  }
}

function asJoinSeat(row: { id: string; network_role: string; network_status: string }): JoinSeat {
  if (row.network_role !== 'member' && row.network_role !== 'coordinator') {
    throw new Error('INVALID_NETWORK_ROLE');
  }
  if (
    row.network_status !== 'pending_approval' &&
    row.network_status !== 'active' &&
    row.network_status !== 'suspended'
  ) {
    throw new InvalidNetworkStatusError(row.network_status);
  }
  return {
    id: row.id,
    network_role: row.network_role,
    network_status: row.network_status,
  };
}

export async function findMyMembership(communityId: string, userId: string): Promise<JoinSeat | null> {
  const result = await queryAsMember<{ id: string; network_role: string; network_status: string }>(
    { userId, communityId },
    `SELECT id, network_role, network_status
     FROM network_core.memberships
     WHERE community_id = $1 AND user_id = $2`,
    [communityId, userId]
  );
  const row = result.rows[0];
  return row ? asJoinSeat(row) : null;
}

export async function requestJoin(communityId: string, userId: string): Promise<JoinSeat> {
  const existing = await findMyMembership(communityId, userId);
  if (existing) {
    throw new DuplicateMembershipError();
  }
  try {
    const inserted = await queryAsMember<JoinSeat>(
      { userId, communityId },
      `INSERT INTO network_core.memberships (community_id, user_id, network_role, network_status)
       VALUES ($1, $2, 'member', 'pending_approval')
       RETURNING id, network_role, network_status`,
      [communityId, userId]
    );
    const row = inserted.rows[0];
    if (!row) {
      throw new Error('JOIN_INSERT_FAILED');
    }
    return asJoinSeat(row);
  } catch (err) {
    const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: string }).code) : '';
    if (code === '23505') {
      throw new DuplicateMembershipError();
    }
    throw err;
  }
}

export type PendingJoinRow = {
  id: string;
  full_name: string;
  network_status: string;
};

export async function listPendingJoins(ctx: AppQueryContext): Promise<PendingJoinRow[]> {
  if (!ctx.communityId) {
    return [];
  }
  const result = await queryAsMember<PendingJoinRow>(
    ctx,
    `SELECT m.id, coalesce(nullif(p.full_name, ''), '') AS full_name, m.network_status
     FROM network_core.memberships m
     JOIN person_core.profiles p ON p.user_id = m.user_id
     WHERE m.community_id = $1 AND m.network_status = 'pending_approval'
     ORDER BY p.full_name`,
    [ctx.communityId]
  );
  return result.rows;
}

export async function decideJoinRequest(
  ctx: AppQueryContext,
  membershipId: string,
  action: 'approve' | 'reject'
): Promise<{ status: 'active' | 'suspended' }> {
  if (!ctx.communityId) {
    throw new JoinNotAllowedError();
  }
  const status = action === 'approve' ? 'active' : action === 'reject' ? 'suspended' : null;
  if (!status) {
    throw new JoinNotAllowedError();
  }
  const updated = await queryAsMember(
    ctx,
    `UPDATE network_core.memberships
     SET network_status = $1
     WHERE id = $2 AND community_id = $3 AND network_status = 'pending_approval'
     RETURNING id`,
    [status, membershipId, ctx.communityId]
  );
  if (!updated.rows[0]) {
    throw new JoinNotAllowedError();
  }
  return { status };
}
