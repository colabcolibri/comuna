import { NextRequest, NextResponse } from 'next/server';
import { consumeOtp, InvalidOtpError, AUTH_COOKIE, signMemberToken } from '@community/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'E-mail e código são obrigatórios.' } },
        { status: 400 }
      );
    }

    const user = await consumeOtp(email, String(code));
    const token = await signMemberToken({
      sub: user.id,
      email: user.email,
      global_role: user.global_role,
    });

    const response = NextResponse.json({
      success: true,
      user: { email: user.email, global_role: user.global_role },
    });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (err: unknown) {
    if (err instanceof InvalidOtpError) {
      return NextResponse.json(
        { error: { code: 'INVALID_OTP', message: 'Código de verificação incorreto ou expirado' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Erro ao validar código' } },
      { status: 500 }
    );
  }
}
