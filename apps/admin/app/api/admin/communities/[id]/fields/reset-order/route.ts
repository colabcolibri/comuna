import { NextRequest } from 'next/server';
import { resetCatalogOrder } from '@community/directory/ops';
import { catalogOk, catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  try {
    await resetCatalogOrder(id);
    return catalogOk();
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
