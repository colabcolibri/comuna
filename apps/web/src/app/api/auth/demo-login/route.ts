import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE,
  DemoLoginForbiddenError,
  isDemoMemberLoginEnabled,
  memberAuthCookieOptions,
  resolveDemoMemberLogin,
  signMemberToken,
} from '@community/auth';

const ipHits = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;

function rateLimited(ip: string): boolean {
  const recent = ipHits.get(ip)?.filter((t) => Date.now() - t < RATE_WINDOW_MS) ?? [];
  if (recent.length >= RATE_MAX) {
    return true;
  }
  recent.push(Date.now());
  ipHits.set(ip, recent);
  return false;
}

function forbidden() {
  return NextResponse.json(
    { error: { code: 'DEMO_LOGIN_FORBIDDEN', message: 'Conta indisponível na demonstração.' } },
    { status: 403 }
  );
}

export async function POST(req: NextRequest) {
  if (!isDemoMemberLoginEnabled()) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) {
    return forbidden();
  }

  try {
    const body = await req.json();
    const email = body?.email;
    if (!email || typeof email !== 'string') {
      return forbidden();
    }
    const user = await resolveDemoMemberLogin(email);
    const token = await signMemberToken({
      sub: user.id,
      email: user.email,
      global_role: user.global_role,
    });
    const response = NextResponse.json({
      success: true,
      user: { email: user.email, global_role: user.global_role },
    });
    response.cookies.set(AUTH_COOKIE, token, memberAuthCookieOptions());
    return response;
  } catch (err: unknown) {
    if (err instanceof DemoLoginForbiddenError) {
      return forbidden();
    }
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Erro ao entrar na demonstração' } },
      { status: 500 }
    );
  }
}
