import { NextRequest } from 'next/server';
import { AUTH_COOKIE, verifyMemberToken, MemberClaims } from './session';

export async function memberFromRequest(req: NextRequest): Promise<MemberClaims | null> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    return await verifyMemberToken(token);
  } catch {
    return null;
  }
}
