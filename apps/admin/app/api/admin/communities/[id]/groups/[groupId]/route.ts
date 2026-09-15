import { NextRequest, NextResponse } from 'next/server';
import { deleteCatalogGroup, updateCatalogGroupColumns } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, groupId } = await ctx.params;
  const body = await req.json();
  try {
    await updateCatalogGroupColumns(id, groupId, Number(body.columns));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, groupId } = await ctx.params;
  try {
    await deleteCatalogGroup(id, groupId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
