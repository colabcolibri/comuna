import { NextRequest, NextResponse } from 'next/server';
import { getCommunity } from '@community/communities';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const community = await getCommunity(id);
  if (!community) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  return NextResponse.json(community);
}
