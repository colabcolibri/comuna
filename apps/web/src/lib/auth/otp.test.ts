import { describe, it, expect } from 'vitest';
import { generateOtp, hashOtp, verifyOtpHash } from './otp';

describe('OTP Auth Module (US-0001)', () => {
  it('gerar um codigo de 6 digitos numericos', () => {
    const code = generateOtp();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('gerar um hash seguro do codigo OTP', () => {
    const code = '123456';
    const hash = hashOtp(code);
    expect(hash).not.toBe(code);
    expect(verifyOtpHash(code, hash)).toBe(true);
    expect(verifyOtpHash('654321', hash)).toBe(false);
  });
});
