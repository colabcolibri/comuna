import { NextRequest, NextResponse } from 'next/server';
import { listOpsListFields, saveOpsListFields } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string; listKey: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, listKey } = await ctx.params;
  try {
    const data = await listOpsListFields(id, listKey);
    return NextResponse.json({ data });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string; listKey: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, listKey } = await ctx.params;
  const body = await req.json();
  try {
    await saveOpsListFields(id, listKey, body.fields);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
