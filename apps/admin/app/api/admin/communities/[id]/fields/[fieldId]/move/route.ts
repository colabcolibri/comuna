import { NextRequest } from 'next/server';
import { moveCatalogField, moveCatalogFieldToGroup } from '@community/directory/ops';
import { catalogOk, catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireCommunityOps } from '@/lib/require-ops';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string; fieldId: string }> }) {
  const {id, fieldId} = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const body = await req.json();
  try {
    if (typeof body.groupId === 'string' && body.groupId) {
      await moveCatalogFieldToGroup(id, fieldId, body.groupId);
      return catalogOk();
    }
    const direction = body.direction === 'down' ? 'down' : 'up';
    await moveCatalogField(id, fieldId, direction);
    return catalogOk();
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
