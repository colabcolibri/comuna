import { NextRequest, NextResponse } from 'next/server';
import { listCommunityModuleStates } from '@community/module-runtime';
import { query } from '@community/db';
import { isOpsClaims, requireOps } from '@/lib/require-ops';
import { firstPartySlugs } from '@/lib/registry';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const data = await listCommunityModuleStates(query, id, firstPartySlugs);
  return NextResponse.json({ data });
}
