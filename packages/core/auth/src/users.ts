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
