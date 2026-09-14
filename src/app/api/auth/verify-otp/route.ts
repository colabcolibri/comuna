import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpHash } from '@/lib/auth/otp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: 'E-mail e Código são obrigatórios.' } },
        { status: 400 }
      );
    }

    // Em ambiente de teste local, aceitamos o código digitado ou a simulação
    const response = NextResponse.json({
      success: true,
      message: 'Autenticado com sucesso!',
      user: {
        email,
        role: email === 'admin@alumni.org' ? 'admin' : 'alumni'
      }
    });

    // Definir Cookie HttpOnly de Sessão (JWT / Auth Token)
    response.cookies.set('auth_token', `token_simulado_${Date.now()}`, {
      httpOnly: true,
      secure: false, // Localhost
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 dias
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
