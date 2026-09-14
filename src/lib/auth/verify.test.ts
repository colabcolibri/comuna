import { describe, it, expect } from 'vitest';
import { verifyOtpCode } from './verify';
import { hashOtp } from './otp';

describe('OTP Verification Engine (US-0002)', () => {
  it('deve aprovar codigo correto dentro do limite de tentativas e expiracao', () => {
    const code = '123456';
    const hash = hashOtp(code);
    const futureExpiry = new Date(Date.now() + 10 * 60 * 1000); // +10 min

    const result = verifyOtpCode(code, hash, 0, futureExpiry);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar e bloquear token se ultrapassar 5 tentativas', () => {
    const code = '123456';
    const hash = hashOtp(code);
    const futureExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const result = verifyOtpCode(code, hash, 5, futureExpiry);
    expect(result.success).toBe(false);
    expect(result.error).toBe('EXCEEDED_ATTEMPTS');
  });

  it('deve rejeitar codigo se estiver expirado', () => {
    const code = '123456';
    const hash = hashOtp(code);
    const pastExpiry = new Date(Date.now() - 1000); // expirado

    const result = verifyOtpCode(code, hash, 0, pastExpiry);
    expect(result.success).toBe(false);
    expect(result.error).toBe('EXPIRED_TOKEN');
  });
});
