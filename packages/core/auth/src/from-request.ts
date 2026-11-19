import 'server-only';

import { AUTH_COOKIE, OPS_COOKIE, verifyMemberToken, verifyOpsToken, MemberClaims } from './session';

type RequestWithCookies = {
  cookies: {
    get(name: string): { value: string } | undefined;
  };
};

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

export async function memberFromRequest(req: RequestWithCookies): Promise<MemberClaims | null> {
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

export async function opsFromRequest(req: RequestWithCookies): Promise<MemberClaims | null> {
  return opsFromCookieValue(req.cookies.get(OPS_COOKIE)?.value);
}
