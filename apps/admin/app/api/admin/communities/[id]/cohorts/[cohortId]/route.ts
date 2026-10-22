import { NextRequest, NextResponse } from 'next/server';
import { CohortNotFoundError, deleteCohort } from '@community/memberships';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireCommunityOps } from '@/lib/require-ops';

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; cohortId: string }> }) {
  const {id, cohortId} = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
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
