import { query, queryAsOps } from '@community/db';

export type NetworkRole = 'member' | 'coordinator';

export type MembershipRow = {
  id: string;
  network_role: NetworkRole;
  network_status: string;
  user_id: string;
  email: string;
};

export class MembershipNotFoundError extends Error {
  constructor() {
    super('Membership not found');
    this.name = 'MembershipNotFoundError';
  }
}

export class InvalidNetworkRoleError extends Error {
  constructor(role: string) {
    super(`Invalid network_role: ${role}`);
    this.name = 'InvalidNetworkRoleError';
  }
}

function asRole(role: string): NetworkRole {
  if (role === 'member' || role === 'coordinator') {
    return role;
  }
  throw new InvalidNetworkRoleError(role);
}

export async function findMembershipByEmail(
  communityId: string,
  email: string
): Promise<MembershipRow | null> {
  const result = await query<MembershipRow>(
    `SELECT m.id, m.network_role, m.network_status, m.user_id, u.email
     FROM network_core.memberships m
     JOIN auth_core.users u ON u.id = m.user_id
     WHERE m.community_id = $1 AND lower(u.email) = lower($2)`,
    [communityId, email.trim()]
  );
  return result.rows[0] ?? null;
}

export class UserNotFoundError extends Error {
  constructor() {
    super('USER_NOT_FOUND');
    this.name = 'UserNotFoundError';
  }
}

export type EligiblePerson = {
  id: string;
  email: string;
  full_name: string;
};

export const PEOPLE_SEARCH_MIN = 2;
export const PEOPLE_SEARCH_LIMIT = 20;
const PEOPLE_SEARCH_Q_MAX = 80;

export function likeContains(raw: string): string {
  return `%${raw.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
}

export async function searchPeopleOutsideCommunity(
  communityId: string,
  q: string
): Promise<EligiblePerson[]> {
  const needle = q.trim().slice(0, PEOPLE_SEARCH_Q_MAX);
  if (needle.length < PEOPLE_SEARCH_MIN) {
    return [];
  }
  const result = await queryAsOps<EligiblePerson>(
    `SELECT u.id, u.email, coalesce(nullif(p.full_name, ''), u.email) AS full_name
     FROM auth_core.users u
     LEFT JOIN person_core.profiles p ON p.user_id = u.id
     WHERE NOT EXISTS (
       SELECT 1
       FROM network_core.memberships m
       WHERE m.community_id = $1 AND m.user_id = u.id
     )
     AND (
       u.email ILIKE $2 ESCAPE E'\\\\'
       OR coalesce(p.full_name, '') ILIKE $2 ESCAPE E'\\\\'
     )
     ORDER BY
       CASE
         WHEN lower(u.email) = lower($3) THEN 0
         WHEN starts_with(lower(u.email), lower($3)) THEN 1
         ELSE 2
       END,
       3,
       u.email
     LIMIT $4`,
    [communityId, likeContains(needle), needle, PEOPLE_SEARCH_LIMIT]
  );
  return result.rows;
}

export async function addExistingMember(
  communityId: string,
  userId: string,
  role?: string
): Promise<MembershipRow> {
  const found = await query<{ id: string; email: string }>(
    `SELECT id, email FROM auth_core.users WHERE id = $1`,
    [userId]
  );
  const user = found.rows[0];
  if (!user) {
    throw new UserNotFoundError();
  }
  return addMembership({ communityId, userId: user.id, email: user.email, role });
}

export class DuplicateMembershipError extends Error {
  constructor() {
    super('DUPLICATE_MEMBERSHIP');
    this.name = 'DuplicateMembershipError';
  }
}

export async function addMembership(input: {
  communityId: string;
  userId: string;
  email: string;
  role?: string;
}): Promise<MembershipRow> {
  const networkRole = asRole(input.role || 'member');
  try {
    const inserted = await queryAsOps<MembershipRow>(
      `INSERT INTO network_core.memberships (community_id, user_id, network_role, network_status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id, network_role, network_status, user_id`,
      [input.communityId, input.userId, networkRole]
    );
    const row = inserted.rows[0];
    if (!row) {
      throw new Error('MEMBERSHIP_INSERT_FAILED');
    }
    return { ...row, email: input.email };
  } catch (err) {
    const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: string }).code) : '';
    if (code === '23505') {
      throw new DuplicateMembershipError();
    }
    throw err;
  }
}

export async function listMemberships(communityId: string): Promise<MembershipRow[]> {
  const result = await query<MembershipRow>(
    `SELECT m.id, m.network_role, m.network_status, m.user_id, u.email
     FROM network_core.memberships m
     JOIN auth_core.users u ON u.id = m.user_id
     WHERE m.community_id = $1
     ORDER BY u.email`,
    [communityId]
  );
  return result.rows;
}

export async function setNetworkRole(membershipId: string, role: string): Promise<MembershipRow> {
  const networkRole = asRole(role);
  const updated = await query<MembershipRow>(
    `UPDATE network_core.memberships AS m
     SET network_role = $2
     FROM auth_core.users u
     WHERE m.id = $1 AND u.id = m.user_id
     RETURNING m.id, m.network_role, m.network_status, m.user_id, u.email`,
    [membershipId, networkRole]
  );
  if (!updated.rows[0]) {
    throw new MembershipNotFoundError();
  }
  return updated.rows[0];
}
