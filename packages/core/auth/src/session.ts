import { SignJWT, jwtVerify } from 'jose';
import { loadRootEnv } from '../../db/src/load-root-env';

const COOKIE = 'auth_token';

function secret() {
  loadRootEnv();
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error('JWT_SECRET is required');
  }
  return new TextEncoder().encode(value);
}

export type MemberClaims = {
  sub: string;
  email: string;
  global_role: string;
};

export async function signMemberToken(claims: MemberClaims): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
}

export async function verifyMemberToken(token: string): Promise<MemberClaims> {
  const { payload } = await jwtVerify(token, secret());
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    global_role: String(payload.global_role),
  };
}

export const AUTH_COOKIE = COOKIE;
