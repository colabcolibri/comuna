import crypto from 'crypto';

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function verifyOtpHash(code: string, hash: string): boolean {
  const computedHash = hashOtp(code);
  if (computedHash.length !== hash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
}
