import { NextRequest } from 'next/server';
import { AUTH_COOKIE, verifyMemberToken, MemberClaims } from './session';

export async function memberFromCookieValue(token: string | undefined): Promise<MemberClaims | null> {
  if (!token) {
    return null;
  }
  try {
    return await verifyMemberToken(token);
  } catch {
    return null;
  }
}

export async function memberFromRequest(req: NextRequest): Promise<MemberClaims | null> {
  return memberFromCookieValue(req.cookies.get(AUTH_COOKIE)?.value);
}
