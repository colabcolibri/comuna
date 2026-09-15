import { NextRequest, NextResponse } from 'next/server';
import { OPS_COOKIE, verifyOpsToken } from '../../packages/core/auth/src/session';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPath =
    pathname === '/communities' ||
    pathname.startsWith('/communities/') ||
    pathname === '/people' ||
    pathname.startsWith('/people/') ||
    pathname === '/platform' ||
    pathname.startsWith('/platform/') ||
    pathname === '/emails' ||
    pathname.startsWith('/emails/');
  if (!protectedPath) {
    return NextResponse.next();
  }
  const token = req.cookies.get(OPS_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  try {
    const claims = await verifyOpsToken(token);
    if (claims.global_role !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/communities', '/communities/:path*', '/people', '/people/:path*', '/platform', '/platform/:path*', '/emails', '/emails/:path*'],
};
