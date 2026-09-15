import { NextRequest, NextResponse } from 'next/server';
import {
  InvalidNetworkStatusError,
  MembershipNotFoundError,
  setNetworkStatus,
} from '@community/memberships';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const body = await req.json();
  try {
    const row = await setNetworkStatus(id, String(body.network_status || ''));
    return NextResponse.json(row);
  } catch (err) {
    if (err instanceof InvalidNetworkStatusError) {
      return jsonError('VALIDATION_ERROR', err.message, 400);
    }
    if (err instanceof MembershipNotFoundError) {
      return jsonError('NOT_FOUND', 'Membership inexistente', 404);
    }
    throw err;
  }
}
