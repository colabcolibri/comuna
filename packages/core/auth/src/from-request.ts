import 'server-only';

import { NextRequest } from 'next/server';
import { AUTH_COOKIE, OPS_COOKIE, verifyMemberToken, verifyOpsToken, MemberClaims } from './session';

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

export async function opsFromCookieValue(token: string | undefined): Promise<MemberClaims | null> {
  if (!token) {
    return null;
  }
  try {
    return await verifyOpsToken(token);
  } catch {
    return null;
  }
}

export async function opsFromRequest(req: NextRequest): Promise<MemberClaims | null> {
  return opsFromCookieValue(req.cookies.get(OPS_COOKIE)?.value);
}
