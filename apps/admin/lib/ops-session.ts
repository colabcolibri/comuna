import { cookies } from 'next/headers';
import { OPS_COOKIE, opsFromCookieValue, type MemberClaims } from '@community/auth';

export async function getOpsSession(): Promise<MemberClaims | null> {
  const token = (await cookies()).get(OPS_COOKIE)?.value;
  const ops = await opsFromCookieValue(token);
  if (!ops || ops.global_role !== 'super_admin') {
    return null;
  }
  return ops;
}
