import 'server-only';

import { DEMO_MEMBER_LOGIN_EMAIL, DEMO_OPS_LOGIN_EMAIL } from './demo-login-constants';
import { findUserByEmail, isSuperAdmin, normalizeEmail, type AuthUser } from './users';

export { DEMO_MEMBER_LOGIN_EMAIL, DEMO_OPS_LOGIN_EMAIL } from './demo-login-constants';

export class DemoLoginForbiddenError extends Error {
  constructor() {
    super('DEMO_LOGIN_FORBIDDEN');
    this.name = 'DemoLoginForbiddenError';
  }
}

export function isDemoLoginEnabled(): boolean {
  return process.env.DATABASE_READ_ONLY === '1';
}

export function isDemoMemberLoginEnabled(): boolean {
  return isDemoLoginEnabled();
}

export function isDemoOpsLoginEnabled(): boolean {
  return isDemoLoginEnabled();
}

export function isDemoMemberLoginEmail(email: string): boolean {
  return normalizeEmail(email) === DEMO_MEMBER_LOGIN_EMAIL;
}

export function isDemoOpsLoginEmail(email: string): boolean {
  return normalizeEmail(email) === DEMO_OPS_LOGIN_EMAIL;
}

export async function resolveDemoMemberLogin(email: string): Promise<AuthUser> {
  if (!isDemoMemberLoginEnabled() || !isDemoMemberLoginEmail(email)) {
    throw new DemoLoginForbiddenError();
  }
  const user = await findUserByEmail(email);
  if (!user || isSuperAdmin(user.global_role)) {
    throw new DemoLoginForbiddenError();
  }
  return user;
}

export async function resolveDemoOpsLogin(email: string): Promise<AuthUser> {
  if (!isDemoOpsLoginEnabled() || !isDemoOpsLoginEmail(email)) {
    throw new DemoLoginForbiddenError();
  }
  const user = await findUserByEmail(email);
  if (!user || !isSuperAdmin(user.global_role)) {
    throw new DemoLoginForbiddenError();
  }
  return user;
}
