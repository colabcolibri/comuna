import { NextRequest } from 'next/server';
import { moveCatalogGroup } from '@community/directory/ops';
import { catalogOk, catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string; groupId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, groupId } = await ctx.params;
  const body = await req.json();
  const direction = body.direction === 'down' ? 'down' : 'up';
  try {
    await moveCatalogGroup(id, groupId, direction);
    return catalogOk();
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
