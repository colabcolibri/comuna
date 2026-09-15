import { NextRequest, NextResponse } from 'next/server';
import { CohortNotFoundError, deleteCohort } from '@community/memberships';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; cohortId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, cohortId } = await ctx.params;
  try {
    await deleteCohort(id, cohortId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CohortNotFoundError) {
      return jsonError('NOT_FOUND', 'Turma inexistente', 404);
    }
    throw err;
  }
}
