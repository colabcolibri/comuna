export function memberAuthCookieOptions(overrides?: { maxAge?: number }) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: overrides?.maxAge ?? 30 * 24 * 60 * 60,
  };
}
