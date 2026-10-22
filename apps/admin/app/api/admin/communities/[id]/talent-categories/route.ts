import { NextRequest, NextResponse } from 'next/server';
import { query } from '@community/db';
import { getCommunity } from '@community/communities';
import {
  TalentCategoryError,
  createOpsTalentCategory,
  listOpsTalentCategories,
} from '@community/talent/ops';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireCommunityOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  if (!(await getCommunity(id))) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  const data = await listOpsTalentCategories(id, (sql, params) => query(sql, params));
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  if (!(await getCommunity(id))) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  try {
    const row = await createOpsTalentCategory(id, (sql, params) => query(sql, params), await req.json());
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (err) {
    if (err instanceof TalentCategoryError) {
      return jsonError('VALIDATION_ERROR', err.message, 400);
    }
    throw err;
  }
}
