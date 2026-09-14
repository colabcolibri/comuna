import { cookies } from 'next/headers';
import { AUTH_COOKIE, memberFromCookieValue, type MemberClaims } from '@community/auth';

export async function getMemberSession(): Promise<MemberClaims | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  return memberFromCookieValue(token);
}
