import { NextRequest, NextResponse } from 'next/server';
import { CatalogWriteError, createAttributeField, listOpsCatalog } from '@community/directory/ops';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const data = await listOpsCatalog(id);
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const body = await req.json();
  try {
    const field = await createAttributeField(id, {
      name: String(body.name || ''),
      type: String(body.type || ''),
      labelPt: String(body.labelPt || ''),
      labelEn: String(body.labelEn || ''),
      optionsText: typeof body.optionsText === 'string' ? body.optionsText : '',
      filterable: Boolean(body.filterable),
    });
    return NextResponse.json(field, { status: 201 });
  } catch (err) {
    if (err instanceof CatalogWriteError && err.message === 'DUPLICATE_FIELD') {
      return jsonError('VALIDATION_ERROR', 'Campo duplicado', 409);
    }
    if (err instanceof CatalogWriteError) {
      return jsonError('VALIDATION_ERROR', 'Campo inválido', 400);
    }
    throw err;
  }
}
