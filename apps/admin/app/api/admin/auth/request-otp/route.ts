import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, isSuperAdmin, issueOtp, RateLimitError } from '@community/auth';
import { sendKindEmail } from '@community/mail';
import { jsonError } from '@/lib/http';

const ipHits = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return jsonError('VALIDATION_ERROR', 'E-mail inválido', 400);
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const recentIp = ipHits.get(ip)?.filter((t) => Date.now() - t < 60_000) ?? [];
    if (recentIp.length >= 3) {
      return jsonError('RATE_LIMIT_EXCEEDED', 'Muitas solicitações', 429);
    }
    recentIp.push(Date.now());
    ipHits.set(ip, recentIp);

    const user = await findUserByEmail(email);
    if (!user || !isSuperAdmin(user.global_role)) {
      return NextResponse.json({ message: 'Código enviado' });
    }

    const code = await issueOtp(user.email);
    if (process.env.ALLOW_DEV_OTP === 'true') {
      console.log(`[OTP ops] queued for ${user.email} (not in JSON)`);
    }
    const locale = resolveUiLocale(req.cookies.get(LOCALE_COOKIE)?.value);
    try {
      await sendKindEmail({ kind: 'ops_otp', to: user.email, locale, vars: { code } });
    } catch {
      return jsonError('SERVER_ERROR', 'Falha ao enviar e-mail', 500);
    }
    return NextResponse.json({ message: 'Código enviado' });
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      return jsonError('RATE_LIMIT_EXCEEDED', 'Muitas solicitações', 429);
    }
    return jsonError('SERVER_ERROR', 'Erro ao pedir código', 500);
  }
}
