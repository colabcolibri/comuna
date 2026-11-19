import 'server-only';

import { query } from '@community/db';
import { verifyOtpHash } from './otp';
import { signMemberToken } from './session';
import { normalizeEmail } from './users';

export class InvalidOtpError extends Error {
  constructor() {
    super('INVALID_OTP');
    this.name = 'InvalidOtpError';
  }
}

export async function consumeOtp(email: string, code: string): Promise<{ id: string; global_role: string; email: string }> {
  const normalized = normalizeEmail(email);
  const token = await query<{ id: string; code_hash: string; attempts: number }>(
    `SELECT id, code_hash, attempts
     FROM auth_core.verification_tokens
     WHERE lower(email) = $1 AND expires_at > now()
     ORDER BY created_at DESC
     LIMIT 1
     FOR UPDATE`,
    [normalized]
  );
  const row = token.rows[0];
  if (!row) {
    throw new InvalidOtpError();
  }
  if (row.attempts >= 5) {
    throw new InvalidOtpError();
  }
  if (!verifyOtpHash(code, row.code_hash)) {
    await query(`UPDATE auth_core.verification_tokens SET attempts = attempts + 1 WHERE id = $1`, [row.id]);
    throw new InvalidOtpError();
  }
  await query(`DELETE FROM auth_core.verification_tokens WHERE id = $1`, [row.id]);
  const existing = await query<{ id: string; global_role: string; status?: string }>(
    `SELECT id, global_role, status FROM auth_core.users WHERE lower(email) = $1`,
    [normalized]
  );
  if (existing.rows[0]) {
    if (existing.rows[0].status && existing.rows[0].status !== 'active') {
      throw new InvalidOtpError();
    }
    return { id: existing.rows[0].id, global_role: existing.rows[0].global_role, email: normalized };
  }
  const created = await query<{ id: string; global_role: string }>(
    `INSERT INTO auth_core.users (email, global_role, status)
     VALUES ($1, 'user', 'active')
     RETURNING id, global_role`,
    [normalized]
  );
  return { id: created.rows[0].id, global_role: created.rows[0].global_role, email: normalized };
}

export { signMemberToken };
