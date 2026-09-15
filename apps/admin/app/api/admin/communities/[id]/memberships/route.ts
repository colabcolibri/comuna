import { NextRequest, NextResponse } from 'next/server';
import { findMembershipByEmail, listMemberships } from '@community/memberships';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const email = req.nextUrl.searchParams.get('email');
  if (email) {
    if (!email.includes('@')) {
      return jsonError('VALIDATION_ERROR', 'email obrigatório', 400);
    }
    const membership = await findMembershipByEmail(id, email);
    if (!membership) {
      return jsonError('NOT_FOUND', 'Membership inexistente', 404);
    }
    return NextResponse.json(membership);
  }
  const data = await listMemberships(id);
  return NextResponse.json({ data });
}
