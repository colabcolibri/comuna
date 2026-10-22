import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin } from '@community/auth';
import { OPS_COOKIE, verifyOpsToken } from '../../packages/core/auth/src/session';
import { canAccessOpsPortal } from '@community/memberships';
import { readOnlyBlockedResponse } from './lib/read-only';

const NETWORK_ONLY_PREFIXES = ['/people', '/platform', '/emails'];

function isNetworkOnlyPath(pathname: string): boolean {
  return NETWORK_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(req: NextRequest) {
  const blocked = readOnlyBlockedResponse(req);
  if (blocked) {
    return blocked;
  }
  const { pathname } = req.nextUrl;
  const protectedPath =
    pathname === '/communities' ||
    pathname.startsWith('/communities/') ||
    isNetworkOnlyPath(pathname);
  if (!protectedPath) {
    return NextResponse.next();
  }
  const token = req.cookies.get(OPS_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  try {
    const claims = await verifyOpsToken(token);
    if (!(await canAccessOpsPortal(claims.sub, claims.global_role))) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (isNetworkOnlyPath(pathname) && !isSuperAdmin(claims.global_role)) {
      return NextResponse.redirect(new URL('/communities', req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    '/communities',
    '/communities/:path*',
    '/people',
    '/people/:path*',
    '/platform',
    '/platform/:path*',
    '/emails',
    '/emails/:path*',
    '/api/:path*',
  ],
};
