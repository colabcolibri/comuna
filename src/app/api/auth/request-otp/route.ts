import { NextRequest, NextResponse } from 'next/server';
import { generateOtp, hashOtp } from '@/lib/auth/otp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: { code: 'INVALID_EMAIL', message: 'E-mail inválido fornecido.' } },
        { status: 400 }
      );
    }

    // Gerar código OTP e Hash
    const otpCode = generateOtp();
    const otpHash = hashOtp(otpCode);

    // Em ambiente local, exibimos o código no terminal e log para facilidade de testes
    console.log(`\n==================================================`);
    console.log(`🔑 [OTP ENVIADO PARA]: ${email}`);
    console.log(`🔢 [CÓDIGO DE VERIFICAÇÃO]: ${otpCode}`);
    console.log(`📬 [CAIXA MAILPIT]: http://localhost:8026`);
    console.log(`==================================================\n`);

    return NextResponse.json({
      success: true,
      message: `Código OTP enviado com sucesso para ${email}. Verifique a caixa no Mailpit (http://localhost:8026).`,
      // Para ambiente dev facilitado, enviamos o OTP de depuração
      dev_otp: otpCode
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
