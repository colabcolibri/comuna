import { NextRequest, NextResponse } from 'next/server';
import { deleteCatalogGroup } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

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
