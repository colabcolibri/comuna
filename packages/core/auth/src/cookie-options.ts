function baseAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function memberAuthCookieOptions(overrides?: { maxAge?: number }) {
  return baseAuthCookieOptions(overrides?.maxAge ?? 30 * 24 * 60 * 60);
}

export function opsAuthCookieOptions(overrides?: { maxAge?: number }) {
  return baseAuthCookieOptions(overrides?.maxAge ?? 7 * 24 * 60 * 60);
}
