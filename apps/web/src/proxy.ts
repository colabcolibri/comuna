import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, verifyMemberToken } from '../../../packages/core/auth/src/session';
import { memberAuthCookieOptions } from '../../../packages/core/auth/src/cookie-options';
import { COMMUNITY_COOKIE } from '../../../packages/core/communities/src/cookie';

function withCommunityHeader(req: NextRequest, slug: string | null) {
  const requestHeaders = new Headers(req.headers);
  if (slug) {
    requestHeaders.set('x-community-slug', slug);
  }
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (slug) {
    res.cookies.set(COMMUNITY_COOKIE, slug, memberAuthCookieOptions());
  }
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const workspace = pathname.match(/^\/c\/([^/]+)(\/.*)?$/);
  const slug = workspace?.[1] ?? null;
  const job = workspace?.[2] ?? '';
  const protectedPath =
    pathname === '/directory' ||
    pathname.startsWith('/directory/') ||
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/coord' ||
    pathname.startsWith('/coord/') ||
    job.startsWith('/directory') ||
    job.startsWith('/profile') ||
    job.startsWith('/coord');
  if (!protectedPath) {
    return withCommunityHeader(req, slug);
  }
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  try {
    await verifyMemberToken(token);
    return withCommunityHeader(req, slug);
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    '/directory/:path*',
    '/profile/:path*',
    '/directory',
    '/profile',
    '/coord/:path*',
    '/coord',
    '/c/:path*',
  ],
};
