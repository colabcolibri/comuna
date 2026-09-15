import { NextRequest, NextResponse } from 'next/server';
import { LOCALE_COOKIE, pickContent } from '@community/identity';
import { coreWebPack } from '@/lang/core_web';
import { READ_ONLY_ERROR_CODE } from '@/lib/read-only-error';

export function isDatabaseReadOnly(): boolean {
  return process.env.DATABASE_READ_ONLY === '1';
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Rotas de auth que não gravam no Postgres — só cookie de sessão. */
const READ_ONLY_AUTH_EXEMPT_PATHS = new Set(['/api/auth/demo-login', '/api/auth/logout']);

export function readOnlyBlockedResponse(req: NextRequest): NextResponse | null {
  if (!isDatabaseReadOnly()) {
    return null;
  }
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }
  if (READ_ONLY_AUTH_EXEMPT_PATHS.has(req.nextUrl.pathname)) {
    return null;
  }
  if (SAFE_METHODS.has(req.method)) {
    return null;
  }
  const locale = pickContent(coreWebPack, req.cookies.get(LOCALE_COOKIE)?.value);
  return NextResponse.json(
    { error: { code: READ_ONLY_ERROR_CODE, message: locale['demo.write_blocked'] } },
    { status: 403 }
  );
}
