import { NextRequest, NextResponse } from 'next/server';
import { InvalidCohortError, createCohort, listCohorts } from '@community/memberships';
import { getCommunity } from '@community/communities';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  if (!(await getCommunity(id))) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  const data = await listCohorts(id);
  return NextResponse.json({ data });
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
  try {
    const row = await createCohort(id, String(body.name || ''), typeof body.code === 'string' ? body.code : undefined);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof InvalidCohortError) {
      return jsonError('VALIDATION_ERROR', 'nome obrigatório', 400);
    }
    throw err;
  }
}
