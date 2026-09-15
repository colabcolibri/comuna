import { query } from '@community/db';

export type AuthUser = {
  id: string;
  email: string;
  global_role: string;
};

export function isSuperAdmin(globalRole: string): boolean {
  return globalRole === 'super_admin';
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const result = await query<AuthUser>(
    `SELECT id, email, global_role FROM auth_core.users WHERE lower(email) = $1`,
    [normalized]
  );
  return result.rows[0] ?? null;
}

export class InvalidEmailError extends Error {
  constructor() {
    super('INVALID_EMAIL');
    this.name = 'InvalidEmailError';
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export async function ensureUserByEmail(email: string): Promise<AuthUser> {
  if (!isValidEmail(email)) {
    throw new InvalidEmailError();
  }
  const normalized = normalizeEmail(email);
  const existing = await findUserByEmail(normalized);
  if (existing) {
    return existing;
  }
  try {
    const created = await query<AuthUser>(
      `INSERT INTO auth_core.users (email, global_role, status)
       VALUES ($1, 'user', 'active')
       RETURNING id, email, global_role`,
      [normalized]
    );
    return created.rows[0];
  } catch (err) {
    const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: string }).code) : '';
    if (code === '23505') {
      const raced = await findUserByEmail(normalized);
      if (raced) {
        return raced;
      }
    }
    throw err;
  }
}

export async function ensureBareProfile(userId: string, email: string): Promise<void> {
  const local = normalizeEmail(email).split('@')[0] || 'Membro';
  await query(
    `INSERT INTO person_core.profiles (user_id, full_name, preferred_locale)
     VALUES ($1, $2, 'pt-BR')
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, local]
  );
}
