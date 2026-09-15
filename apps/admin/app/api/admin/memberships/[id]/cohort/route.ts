import { NextRequest, NextResponse } from 'next/server';
import {
  InvalidCohortError,
  MembershipNotFoundError,
  setMembershipCohort,
} from '@community/memberships';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const body = await req.json();
  const raw = body.cohortId;
  const cohortId = raw === null || raw === '' ? null : String(raw);
  try {
    await setMembershipCohort(id, cohortId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MembershipNotFoundError) {
      return jsonError('NOT_FOUND', 'Membership inexistente', 404);
    }
    if (err instanceof InvalidCohortError) {
      return jsonError('VALIDATION_ERROR', 'turma inválida', 400);
    }
    throw err;
  }
}
