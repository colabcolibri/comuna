import { NextRequest, NextResponse } from 'next/server';
import {
  consumeOtp,
  findUserByEmail,
  InvalidOtpError,
  isSuperAdmin,
  OPS_COOKIE,
  opsAuthCookieOptions,
  signOpsToken,
} from '@community/auth';
import { jsonError } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;
    if (!email || !code) {
      return jsonError('VALIDATION_ERROR', 'E-mail e código são obrigatórios.', 400);
    }
    const existing = await findUserByEmail(String(email));
    if (!existing || !isSuperAdmin(existing.global_role)) {
      return jsonError('INVALID_OTP', 'Código de verificação incorreto ou expirado', 400);
    }
    const user = await consumeOtp(existing.email, String(code));
    if (!isSuperAdmin(user.global_role)) {
      return jsonError('INVALID_OTP', 'Código de verificação incorreto ou expirado', 400);
    }
    const token = await signOpsToken({
      sub: user.id,
      email: user.email,
      global_role: user.global_role,
    });
    const response = NextResponse.json({
      success: true,
      user: { email: user.email, global_role: user.global_role },
    });
    response.cookies.set(OPS_COOKIE, token, opsAuthCookieOptions());
    return response;
  } catch (err: unknown) {
    if (err instanceof InvalidOtpError) {
      return jsonError('INVALID_OTP', 'Código de verificação incorreto ou expirado', 400);
    }
    return jsonError('SERVER_ERROR', 'Erro ao validar código', 500);
  }
}
