import { query } from '@community/db';

export type NetworkRole = 'member' | 'coordinator';

export type MembershipRow = {
  id: string;
  network_role: NetworkRole;
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
    `SELECT m.id, m.network_role, m.user_id, u.email
     FROM network_core.memberships m
     JOIN auth_core.users u ON u.id = m.user_id
     WHERE m.community_id = $1 AND lower(u.email) = lower($2)`,
    [communityId, email.trim()]
  );
  return result.rows[0] ?? null;
}

export async function setNetworkRole(membershipId: string, role: string): Promise<MembershipRow> {
  const networkRole = asRole(role);
  const updated = await query<MembershipRow>(
    `UPDATE network_core.memberships AS m
     SET network_role = $2
     FROM auth_core.users u
     WHERE m.id = $1 AND u.id = m.user_id
     RETURNING m.id, m.network_role, m.user_id, u.email`,
    [membershipId, networkRole]
  );
  if (!updated.rows[0]) {
    throw new MembershipNotFoundError();
  }
  return updated.rows[0];
}
