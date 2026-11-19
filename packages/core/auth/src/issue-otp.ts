import 'server-only';

import { query } from '@community/db';
import { generateOtp, hashOtp } from './otp';
import { normalizeEmail } from './users';

export class RateLimitError extends Error {
  constructor() {
    super('RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export async function issueOtp(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  const recent = await query<{ n: number }>(
    `SELECT count(*)::int AS n
     FROM auth_core.verification_tokens
     WHERE lower(email) = $1 AND created_at > now() - interval '1 minute'`,
    [normalized]
  );
  if ((recent.rows[0]?.n ?? 0) >= 3) {
    throw new RateLimitError();
  }
  const code = generateOtp();
  await query(
    `INSERT INTO auth_core.verification_tokens (email, code_hash, attempts, expires_at)
     VALUES ($1, $2, 0, now() + interval '10 minutes')`,
    [normalized, hashOtp(code)]
  );
  return code;
}
