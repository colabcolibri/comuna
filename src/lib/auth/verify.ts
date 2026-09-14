import { verifyOtpHash } from './otp';

export interface VerifyOtpResult {
  success: boolean;
  error?: 'EXCEEDED_ATTEMPTS' | 'EXPIRED_TOKEN' | 'INVALID_CODE';
}

/**
 * Valida o código OTP comparando com o hash do banco e checando limite de tentativas e expiração
 */
export function verifyOtpCode(
  inputCode: string,
  storedHash: string,
  currentAttempts: number,
  expiresAt: Date
): VerifyOtpResult {
  // 1. Checar tentativas de brute-force
  if (currentAttempts >= 5) {
    return { success: false, error: 'EXCEEDED_ATTEMPTS' };
  }

  // 2. Checar expiração do token
  if (new Date() > expiresAt) {
    return { success: false, error: 'EXPIRED_TOKEN' };
  }

  // 3. Comparar hash seguro do código
  const isValid = verifyOtpHash(inputCode, storedHash);
  if (!isValid) {
    return { success: false, error: 'INVALID_CODE' };
  }

  return { success: true };
}
