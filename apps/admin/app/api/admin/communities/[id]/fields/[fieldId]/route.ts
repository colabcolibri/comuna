import { NextRequest, NextResponse } from 'next/server';
import { CatalogWriteError, deleteAttributeField } from '@community/directory/ops';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; fieldId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, fieldId } = await ctx.params;
  try {
    await deleteAttributeField(id, fieldId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CatalogWriteError && err.message === 'LOCKED') {
      return jsonError('FORBIDDEN', 'Campo do núcleo', 403);
    }
    if (err instanceof CatalogWriteError && err.message === 'NOT_FOUND') {
      return jsonError('NOT_FOUND', 'Campo inexistente', 404);
    }
    throw err;
  }
}
