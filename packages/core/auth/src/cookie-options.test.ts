import { memberAuthCookieOptions, opsAuthCookieOptions } from './cookie-options';

describe('memberAuthCookieOptions', () => {
  const previous = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = previous;
  });

  it('is httpOnly and sameSite lax; secure only in production', () => {
    process.env.NODE_ENV = 'development';
    expect(memberAuthCookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false,
    });
    process.env.NODE_ENV = 'production';
    expect(memberAuthCookieOptions().secure).toBe(true);
  });

  it('uses a seven-day maxAge for ops', () => {
    expect(opsAuthCookieOptions().maxAge).toBe(7 * 24 * 60 * 60);
    expect(opsAuthCookieOptions()).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
  });
});
