import { NextRequest, NextResponse } from 'next/server';
import { listOpsListFields, saveOpsListFields } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireCommunityOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string; listKey: string }> }) {
  const {id, listKey} = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  try {
    const data = await listOpsListFields(id, listKey);
    return NextResponse.json({ data });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string; listKey: string }> }) {
  const {id, listKey} = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const body = await req.json();
  try {
    await saveOpsListFields(id, listKey, body.fields);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
