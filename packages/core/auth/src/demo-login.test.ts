import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_MEMBER_LOGIN_EMAIL, DEMO_OPS_LOGIN_EMAIL } from './demo-login-constants';
import {
  DemoLoginForbiddenError,
  isDemoMemberLoginEmail,
  isDemoMemberLoginEnabled,
  isDemoOpsLoginEmail,
  isDemoOpsLoginEnabled,
  resolveDemoMemberLogin,
  resolveDemoOpsLogin,
} from './demo-login';

const { findUserByEmail } = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
}));

vi.mock('./users', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./users')>();
  return { ...actual, findUserByEmail };
});

describe('demo login', () => {
  const previousReadOnly = process.env.DATABASE_READ_ONLY;

  beforeEach(() => {
    findUserByEmail.mockReset();
    process.env.DATABASE_READ_ONLY = '1';
  });

  afterEach(() => {
    process.env.DATABASE_READ_ONLY = previousReadOnly;
  });

  it('is off unless the database session is read-only', () => {
    delete process.env.DATABASE_READ_ONLY;
    expect(isDemoMemberLoginEnabled()).toBe(false);
    process.env.DATABASE_READ_ONLY = '1';
    expect(isDemoMemberLoginEnabled()).toBe(true);
  });

  it('accepts only the published demo account', () => {
    expect(isDemoMemberLoginEmail(DEMO_MEMBER_LOGIN_EMAIL)).toBe(true);
    expect(isDemoMemberLoginEmail('member02@demo.example')).toBe(false);
    expect(isDemoMemberLoginEmail('admin@example.com')).toBe(false);
  });

  it('resolves the seed user without writes', async () => {
    findUserByEmail.mockResolvedValue({
      id: 'u1',
      email: DEMO_MEMBER_LOGIN_EMAIL,
      global_role: 'user',
    });
    await expect(resolveDemoMemberLogin(DEMO_MEMBER_LOGIN_EMAIL)).resolves.toMatchObject({
      email: DEMO_MEMBER_LOGIN_EMAIL,
    });
  });

  it('rejects when read-only is off, email is outside the list, or user is ops', async () => {
    await expect(resolveDemoMemberLogin('member02@demo.example')).rejects.toBeInstanceOf(DemoLoginForbiddenError);

    findUserByEmail.mockResolvedValue(null);
    await expect(resolveDemoMemberLogin(DEMO_MEMBER_LOGIN_EMAIL)).rejects.toBeInstanceOf(DemoLoginForbiddenError);

    findUserByEmail.mockResolvedValue({
      id: 'ops',
      email: DEMO_MEMBER_LOGIN_EMAIL,
      global_role: 'super_admin',
    });
    await expect(resolveDemoMemberLogin(DEMO_MEMBER_LOGIN_EMAIL)).rejects.toBeInstanceOf(DemoLoginForbiddenError);

    delete process.env.DATABASE_READ_ONLY;
    findUserByEmail.mockResolvedValue({
      id: 'u1',
      email: DEMO_MEMBER_LOGIN_EMAIL,
      global_role: 'user',
    });
    await expect(resolveDemoMemberLogin(DEMO_MEMBER_LOGIN_EMAIL)).rejects.toBeInstanceOf(DemoLoginForbiddenError);
  });
});

describe('demo ops login', () => {
  const previousReadOnly = process.env.DATABASE_READ_ONLY;

  beforeEach(() => {
    findUserByEmail.mockReset();
    process.env.DATABASE_READ_ONLY = '1';
  });

  afterEach(() => {
    process.env.DATABASE_READ_ONLY = previousReadOnly;
  });

  it('is off unless the database session is read-only', () => {
    delete process.env.DATABASE_READ_ONLY;
    expect(isDemoOpsLoginEnabled()).toBe(false);
    process.env.DATABASE_READ_ONLY = '1';
    expect(isDemoOpsLoginEnabled()).toBe(true);
  });

  it('accepts only the published ops demo account', () => {
    expect(isDemoOpsLoginEmail(DEMO_OPS_LOGIN_EMAIL)).toBe(true);
    expect(isDemoOpsLoginEmail(DEMO_MEMBER_LOGIN_EMAIL)).toBe(false);
    expect(isDemoOpsLoginEmail('other@example.com')).toBe(false);
  });

  it('resolves the seed super-admin without writes', async () => {
    findUserByEmail.mockResolvedValue({
      id: 'ops',
      email: DEMO_OPS_LOGIN_EMAIL,
      global_role: 'super_admin',
    });
    await expect(resolveDemoOpsLogin(DEMO_OPS_LOGIN_EMAIL)).resolves.toMatchObject({
      email: DEMO_OPS_LOGIN_EMAIL,
      global_role: 'super_admin',
    });
  });

  it('rejects when read-only is off, email is outside the list, or user is not ops', async () => {
    await expect(resolveDemoOpsLogin(DEMO_MEMBER_LOGIN_EMAIL)).rejects.toBeInstanceOf(DemoLoginForbiddenError);

    findUserByEmail.mockResolvedValue(null);
    await expect(resolveDemoOpsLogin(DEMO_OPS_LOGIN_EMAIL)).rejects.toBeInstanceOf(DemoLoginForbiddenError);

    findUserByEmail.mockResolvedValue({
      id: 'u1',
      email: DEMO_OPS_LOGIN_EMAIL,
      global_role: 'user',
    });
    await expect(resolveDemoOpsLogin(DEMO_OPS_LOGIN_EMAIL)).rejects.toBeInstanceOf(DemoLoginForbiddenError);

    delete process.env.DATABASE_READ_ONLY;
    findUserByEmail.mockResolvedValue({
      id: 'ops',
      email: DEMO_OPS_LOGIN_EMAIL,
      global_role: 'super_admin',
    });
    await expect(resolveDemoOpsLogin(DEMO_OPS_LOGIN_EMAIL)).rejects.toBeInstanceOf(DemoLoginForbiddenError);
  });
});
