import { NextRequest, NextResponse } from 'next/server';
import { createAttributeField, listOpsCatalog } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
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
      groupId: String(body.groupId || ''),
      name: String(body.name || ''),
      type: String(body.type || ''),
      labelPt: String(body.labelPt || ''),
      labelEn: String(body.labelEn || ''),
      descriptionPt: String(body.descriptionPt || ''),
      descriptionEn: String(body.descriptionEn || ''),
      optionsText: typeof body.optionsText === 'string' ? body.optionsText : undefined,
      options: Array.isArray(body.options) ? body.options : undefined,
      filterable: Boolean(body.filterable),
      span: Number(body.span || 1),
      required: Boolean(body.required),
    });
    return NextResponse.json(field, { status: 201 });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
