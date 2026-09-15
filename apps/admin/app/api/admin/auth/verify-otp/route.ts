import { NextRequest, NextResponse } from 'next/server';
import {
  consumeOtp,
  InvalidOtpError,
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
    const user = await consumeOtp(email, String(code));
    if (user.global_role !== 'super_admin') {
      return jsonError('FORBIDDEN', 'Ops only', 403);
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
