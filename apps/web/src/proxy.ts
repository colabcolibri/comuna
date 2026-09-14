import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, verifyMemberToken } from '../../../packages/core/auth/src/session';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedPath =
    pathname === '/directory' ||
    pathname.startsWith('/directory/') ||
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/coord' ||
    pathname.startsWith('/coord/');
  if (!protectedPath) {
    return NextResponse.next();
  }
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  try {
    await verifyMemberToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/directory/:path*', '/profile/:path*', '/directory', '/profile', '/coord/:path*', '/coord'],
};
