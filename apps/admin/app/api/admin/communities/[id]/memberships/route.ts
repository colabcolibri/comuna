import { NextRequest, NextResponse } from 'next/server';
import {
  DuplicateMembershipError,
  InvalidNetworkRoleError,
  OPS_LIST_LIMIT,
  UserNotFoundError,
  addExistingMember,
  findMembershipByEmail,
  listMemberships,
} from '@community/memberships';
import { getCommunity } from '@community/communities';
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
  const q = req.nextUrl.searchParams.get('q') || '';
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get('offset') || '0') || 0);
  const data = await listMemberships(id, { q, offset });
  return NextResponse.json({ data, meta: { hasMore: data.length === OPS_LIST_LIMIT } });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  if (!(await getCommunity(id))) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  const body = await req.json();
  const userId = typeof body.userId === 'string' ? body.userId : '';
  const role = typeof body.network_role === 'string' ? body.network_role : 'member';
  if (!userId) {
    return jsonError('VALIDATION_ERROR', 'pessoa obrigatória', 400);
  }
  try {
    const membership = await addExistingMember(id, userId, role);
    return NextResponse.json(membership, { status: 201 });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return jsonError('NOT_FOUND', 'Pessoa inexistente', 404);
    }
    if (err instanceof InvalidNetworkRoleError) {
      return jsonError('VALIDATION_ERROR', 'papel inválido', 400);
    }
    if (err instanceof DuplicateMembershipError) {
      return jsonError('VALIDATION_ERROR', 'já é membro', 409);
    }
    throw err;
  }
}
