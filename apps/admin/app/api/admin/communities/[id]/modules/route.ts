import { NextRequest, NextResponse } from 'next/server';
import { listCommunityModuleStates } from '@community/module-runtime';
import { query } from '@community/db';
import { isOpsClaims, requireCommunityOps } from '@/lib/require-ops';
import { firstPartySlugs } from '@/lib/registry';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const data = await listCommunityModuleStates(query, id, firstPartySlugs);
  return NextResponse.json({ data });
}
