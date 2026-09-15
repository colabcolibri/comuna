import { NextRequest, NextResponse } from 'next/server';
import { CommunityNotFoundError, getCommunity, updateCommunity } from '@community/communities';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const community = await getCommunity(id);
  if (!community) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  return NextResponse.json(community);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const body = await req.json();
  const name = typeof body.name === 'string' ? body.name : '';
  const type = typeof body.type === 'string' ? body.type : undefined;
    const is_public_showcase = typeof body.is_public_showcase === 'boolean' ? body.is_public_showcase : undefined;
    const settings = body.settings;
    try {
      const community = await updateCommunity(id, { name, type, is_public_showcase, settings });
    return NextResponse.json(community);
  } catch (err) {
    if (err instanceof CommunityNotFoundError) {
      return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
    }
    if (err instanceof Error && err.message === 'VALIDATION_ERROR') {
      return jsonError('VALIDATION_ERROR', 'name obrigatório', 400);
    }
    throw err;
  }
}
