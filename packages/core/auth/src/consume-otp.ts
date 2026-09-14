import { query } from '@community/db';
import { verifyOtpHash } from './otp';
import { signMemberToken } from './session';

export class InvalidOtpError extends Error {
  constructor() {
    super('INVALID_OTP');
    this.name = 'InvalidOtpError';
  }
}

export async function consumeOtp(email: string, code: string): Promise<{ id: string; global_role: string; email: string }> {
  const token = await query<{ id: string; code_hash: string; attempts: number }>(
    `SELECT id, code_hash, attempts
     FROM auth_core.verification_tokens
     WHERE email = $1 AND expires_at > now()
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
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
  const existing = await query<{ id: string; global_role: string }>(
    `SELECT id, global_role FROM auth_core.users WHERE email = $1`,
    [email]
  );
  if (existing.rows[0]) {
    return { id: existing.rows[0].id, global_role: existing.rows[0].global_role, email };
  }
  const created = await query<{ id: string; global_role: string }>(
    `INSERT INTO auth_core.users (email, global_role, status)
     VALUES ($1, 'user', 'active')
     RETURNING id, global_role`,
    [email]
  );
  return { id: created.rows[0].id, global_role: created.rows[0].global_role, email };
}

export { signMemberToken };
