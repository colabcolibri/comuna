import { memberFromCookieValue } from './from-request';
import { signMemberToken, verifyMemberToken } from './session';

describe('member jwt', () => {
  const previous = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-for-community-platform';
  });

  afterEach(() => {
    process.env.JWT_SECRET = previous;
  });

  it('round-trips claims without deriving role from email', async () => {
    const token = await signMemberToken({
      sub: '11111111-1111-1111-1111-111111111111',
      email: 'admin@alumni.org',
      global_role: 'user',
    });
    const claims = await verifyMemberToken(token);
    expect(claims.global_role).toBe('user');
    expect(claims.email).toBe('admin@alumni.org');
  });

  it('returns claims from a cookie value without touching postgres', async () => {
    const token = await signMemberToken({
      sub: '11111111-1111-1111-1111-111111111111',
      email: 'admin@example.com',
      global_role: 'user',
    });
    const claims = await memberFromCookieValue(token);
    expect(claims?.email).toBe('admin@example.com');
    expect(await memberFromCookieValue(undefined)).toBeNull();
    expect(await memberFromCookieValue('not-a-jwt')).toBeNull();
  });
});
