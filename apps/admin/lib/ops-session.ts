import { cookies } from 'next/headers';
import { isSuperAdmin, OPS_COOKIE, opsFromCookieValue, type MemberClaims } from '@community/auth';
import { listCoordinatorCommunityIds } from '@community/memberships';
import type { OpsAccess } from './require-ops';

export async function getOpsAccess(): Promise<OpsAccess | null> {
  const token = (await cookies()).get(OPS_COOKIE)?.value;
  const claims = await opsFromCookieValue(token);
  if (!claims) {
    return null;
  }
  if (isSuperAdmin(claims.global_role)) {
    return { claims, communityIds: null };
  }
  const communityIds = await listCoordinatorCommunityIds(claims.sub);
  if (communityIds.length === 0) {
    return null;
  }
  return { claims, communityIds };
}

export async function getOpsSession(): Promise<MemberClaims | null> {
  const access = await getOpsAccess();
  return access?.claims ?? null;
}
