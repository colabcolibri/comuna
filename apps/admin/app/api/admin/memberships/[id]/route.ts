import { NextRequest, NextResponse } from 'next/server';
import { MembershipNotFoundError, removeMembership } from '@community/memberships';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireMembershipOps } from '@/lib/require-ops';

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ops = await requireMembershipOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  try {
    await removeMembership(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MembershipNotFoundError) {
      return jsonError('NOT_FOUND', 'Membership inexistente', 404);
    }
    throw err;
  }
}
