import { NextRequest, NextResponse } from 'next/server';
import { searchPeopleOutsideCommunity } from '@community/memberships';
import { getCommunity } from '@community/communities';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  if (!(await getCommunity(id))) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  const q = req.nextUrl.searchParams.get('q') || '';
  const data = await searchPeopleOutsideCommunity(id, q);
  return NextResponse.json({ data });
}
