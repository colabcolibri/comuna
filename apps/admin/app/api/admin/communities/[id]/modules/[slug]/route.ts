import { NextRequest, NextResponse } from 'next/server';
import {
  setCommunityModuleEnabled,
  UnknownCommunityError,
  UnknownModuleError,
} from '@community/module-runtime';
import { query } from '@community/db';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; slug: string }> }
) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, slug } = await ctx.params;
  const body = await req.json();
  try {
    const result = await setCommunityModuleEnabled(query, id, slug, Boolean(body.enabled));
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UnknownModuleError || err instanceof UnknownCommunityError) {
      return jsonError('NOT_FOUND', err.message, 404);
    }
    throw err;
  }
}
