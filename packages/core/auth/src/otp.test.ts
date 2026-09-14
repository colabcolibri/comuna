import { generateOtp, hashOtp, verifyOtpHash } from './otp';

describe('otp helpers', () => {
  it('hashes and verifies without exposing a reversible cipher', () => {
    const code = generateOtp();
    const hashed = hashOtp(code);
    expect(hashed).not.toBe(code);
    expect(verifyOtpHash(code, hashed)).toBe(true);
    expect(verifyOtpHash('000000', hashed)).toBe(false);
  });
});
