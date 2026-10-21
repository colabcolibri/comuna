import { NextRequest, NextResponse } from 'next/server';
import { query } from '@community/db';
import { getCommunity } from '@community/communities';
import {
  TalentCategoryError,
  deleteOpsTalentCategory,
  updateOpsTalentCategory,
} from '@community/talent/ops';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; categoryId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, categoryId } = await ctx.params;
  if (!(await getCommunity(id))) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  try {
    const data = await updateOpsTalentCategory(id, categoryId, (sql, params) => query(sql, params), await req.json());
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof TalentCategoryError) {
      return jsonError('VALIDATION_ERROR', err.message, 400);
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; categoryId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, categoryId } = await ctx.params;
  if (!(await getCommunity(id))) {
    return jsonError('NOT_FOUND', 'Comunidade inexistente', 404);
  }
  try {
    await deleteOpsTalentCategory(id, categoryId, (sql, params) => query(sql, params));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof TalentCategoryError) {
      return jsonError('VALIDATION_ERROR', err.message, 400);
    }
    throw err;
  }
}
