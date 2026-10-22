import { NextRequest } from 'next/server';
import { resetCatalogOrder } from '@community/directory/ops';
import { catalogOk, catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireCommunityOps } from '@/lib/require-ops';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  try {
    await resetCatalogOrder(id);
    return catalogOk();
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
