import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { getCommunityBySlug } from '@community/communities';
import { DuplicateMembershipError, requestJoin } from '@community/memberships';

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  if (member.global_role === 'super_admin') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Use o admin' } }, { status: 403 });
  }
  const { slug } = await ctx.params;
  const community = await getCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Comunidade inexistente' } }, { status: 404 });
  }
  try {
    const seat = await requestJoin(community.id, member.sub);
    return NextResponse.json({ data: seat }, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateMembershipError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Pedido já existe nesta comunidade' } },
        { status: 400 }
      );
    }
    throw err;
  }
}
