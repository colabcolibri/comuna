import { NextResponse } from 'next/server';
import { AUTH_COOKIE, memberAuthCookieOptions } from '@community/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, '', {
    ...memberAuthCookieOptions({ maxAge: 0 }),
  });
  return response;
}
