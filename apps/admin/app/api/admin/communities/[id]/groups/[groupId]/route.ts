import { NextRequest, NextResponse } from 'next/server';
import { deleteCatalogGroup, updateCatalogGroup } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireCommunityOps } from '@/lib/require-ops';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const {id, groupId} = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const body = await req.json();
  try {
    await updateCatalogGroup(id, groupId, {
      columns: Object.prototype.hasOwnProperty.call(body, 'columns') ? body.columns : undefined,
      labelPt: body.labelPt,
      labelEn: body.labelEn,
      enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const {id, groupId} = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  try {
    await deleteCatalogGroup(id, groupId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
