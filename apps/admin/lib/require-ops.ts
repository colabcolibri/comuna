import { NextRequest, NextResponse } from 'next/server';
import { opsFromRequest, type MemberClaims } from '@community/auth';
import { jsonError } from './http';

export async function requireOps(req: NextRequest): Promise<MemberClaims | NextResponse> {
  const ops = await opsFromRequest(req);
  if (!ops) {
    return jsonError('UNAUTHORIZED', 'Ops session required', 401);
  }
  if (ops.global_role !== 'super_admin') {
    return jsonError('FORBIDDEN', 'Ops only', 403);
  }
  return ops;
}

export function isOpsClaims(value: MemberClaims | NextResponse): value is MemberClaims {
  return !(value instanceof Response);
}
