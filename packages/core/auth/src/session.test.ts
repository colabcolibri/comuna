import { memberFromCookieValue, opsFromCookieValue } from './from-request';
import { signMemberToken, signOpsToken, verifyMemberToken, verifyOpsToken } from './session';

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

  it('rejects a member token as ops_token', async () => {
    const member = await signMemberToken({
      sub: '11111111-1111-1111-1111-111111111111',
      email: 'member@example.com',
      global_role: 'user',
    });
    await expect(verifyOpsToken(member)).rejects.toBeTruthy();
    expect(await opsFromCookieValue(member)).toBeNull();
  });

  it('round-trips ops claims with ops audience', async () => {
    const token = await signOpsToken({
      sub: '22222222-2222-2222-2222-222222222222',
      email: 'admin@example.com',
      global_role: 'super_admin',
    });
    const claims = await verifyOpsToken(token);
    expect(claims.global_role).toBe('super_admin');
    expect(await opsFromCookieValue(token)).toMatchObject({ email: 'admin@example.com' });
  });
});
