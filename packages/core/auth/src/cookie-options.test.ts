import { memberAuthCookieOptions } from './cookie-options';

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
});
