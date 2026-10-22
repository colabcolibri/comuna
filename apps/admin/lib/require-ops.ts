import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, opsFromRequest, type MemberClaims } from '@community/auth';
import { listCoordinatorCommunityIds, membershipCommunityId } from '@community/memberships';
import { jsonError } from './http';

export type OpsAccess = {
  claims: MemberClaims;
  /** `null` = todas as comunidades (super_admin). */
  communityIds: string[] | null;
};

export function isOpsAccess(value: OpsAccess | NextResponse): value is OpsAccess {
  return !(value instanceof Response);
}

/** @deprecated use isOpsAccess */
export function isOpsClaims(value: OpsAccess | NextResponse): value is OpsAccess {
  return isOpsAccess(value);
}

export function canAccessCommunity(access: OpsAccess, communityId: string): boolean {
  if (access.communityIds === null) {
    return true;
  }
  return access.communityIds.includes(communityId);
}

export async function resolveOpsAccess(req: NextRequest): Promise<OpsAccess | NextResponse> {
  const claims = await opsFromRequest(req);
  if (!claims) {
    return jsonError('UNAUTHORIZED', 'Ops session required', 401);
  }
  if (isSuperAdmin(claims.global_role)) {
    return { claims, communityIds: null };
  }
  const communityIds = await listCoordinatorCommunityIds(claims.sub);
  if (communityIds.length === 0) {
    return jsonError('FORBIDDEN', 'Ops only', 403);
  }
  return { claims, communityIds };
}

export async function requireOps(req: NextRequest): Promise<OpsAccess | NextResponse> {
  return resolveOpsAccess(req);
}

export async function requireSuperOps(req: NextRequest): Promise<MemberClaims | NextResponse> {
  const access = await resolveOpsAccess(req);
  if (!isOpsAccess(access)) {
    return access;
  }
  if (access.communityIds !== null) {
    return jsonError('FORBIDDEN', 'Super-admin only', 403);
  }
  return access.claims;
}

export async function requireCommunityOps(
  req: NextRequest,
  communityId: string
): Promise<OpsAccess | NextResponse> {
  const access = await resolveOpsAccess(req);
  if (!isOpsAccess(access)) {
    return access;
  }
  if (!canAccessCommunity(access, communityId)) {
    return jsonError('FORBIDDEN', 'Sem acesso a esta comunidade', 403);
  }
  return access;
}

export async function requireMembershipOps(
  req: NextRequest,
  membershipId: string
): Promise<OpsAccess | NextResponse> {
  const access = await resolveOpsAccess(req);
  if (!isOpsAccess(access)) {
    return access;
  }
  const communityId = await membershipCommunityId(membershipId);
  if (!communityId) {
    return jsonError('NOT_FOUND', 'Membership inexistente', 404);
  }
  if (!canAccessCommunity(access, communityId)) {
    return jsonError('FORBIDDEN', 'Sem acesso a esta comunidade', 403);
  }
  return access;
}
