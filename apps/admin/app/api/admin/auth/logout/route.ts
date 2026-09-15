import { NextResponse } from 'next/server';
import { OPS_COOKIE, opsAuthCookieOptions } from '@community/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(OPS_COOKIE, '', { ...opsAuthCookieOptions({ maxAge: 0 }), maxAge: 0 });
  return response;
}
