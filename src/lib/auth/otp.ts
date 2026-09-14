import crypto from 'crypto';

/**
 * Gera um código OTP numérico de 6 dígitos
 */
export function generateOtp(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

/**
 * Gera um hash SHA-256 do código OTP para salvar com segurança na tabela verification_tokens
 */
export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Verifica se o código OTP fornecido bate com o hash salvo no banco
 */
export function verifyOtpHash(code: string, hash: string): boolean {
  const computedHash = hashOtp(code);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
}
