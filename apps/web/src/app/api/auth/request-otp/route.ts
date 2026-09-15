import { NextRequest, NextResponse } from 'next/server';
import { issueOtp, RateLimitError, sendSmtpMail } from '@community/auth';
import { interpolate, LOCALE_COOKIE, resolveUiLocale } from '@community/identity';
import { uiCatalog } from '@/lang/catalog';

const ipHits = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'E-mail inválido fornecido.' } },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const recentIp = ipHits.get(ip)?.filter((t) => Date.now() - t < 60_000) ?? [];
    if (recentIp.length >= 3) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas solicitações' } },
        { status: 429 }
      );
    }
    recentIp.push(Date.now());
    ipHits.set(ip, recentIp);

    const code = await issueOtp(email);

    if (process.env.ALLOW_DEV_OTP === 'true') {
      console.log(`[OTP] queued for ${email} (not in JSON)`);
    }

    const locale = resolveUiLocale(req.cookies.get(LOCALE_COOKIE)?.value);
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || '1026');
    if (host) {
      try {
        await sendSmtpMail({
          host,
          port,
          from: process.env.EMAIL_FROM_ADDRESS || 'auth@community.local',
          to: email,
          subject: uiCatalog.t('core_web', 'email.otp.subject', locale),
          text: interpolate(uiCatalog.t('core_web', 'email.otp.text', locale), { code }),
        });
      } catch (mailErr) {
        console.error('[auth] smtp failed', mailErr instanceof Error ? mailErr.message : 'unknown');
        return NextResponse.json(
          { error: { code: 'SERVER_ERROR', message: 'Falha ao enviar e-mail' } },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: 'Código enviado' });
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas solicitações' } },
        { status: 429 }
      );
    }
    console.error('[auth] request-otp', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Erro ao pedir código' } },
      { status: 500 }
    );
  }
}
