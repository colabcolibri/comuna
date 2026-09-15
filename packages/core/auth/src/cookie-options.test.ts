import { afterEach, describe, expect, it, vi } from 'vitest';
import { memberAuthCookieOptions, opsAuthCookieOptions } from './cookie-options';

describe('memberAuthCookieOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is httpOnly and sameSite lax; secure only in production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(memberAuthCookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false,
    });
    vi.stubEnv('NODE_ENV', 'production');
    expect(memberAuthCookieOptions().secure).toBe(true);
  });

  it('uses a seven-day maxAge for ops', () => {
    expect(opsAuthCookieOptions().maxAge).toBe(7 * 24 * 60 * 60);
    expect(opsAuthCookieOptions()).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
  });
});
