import { NextRequest, NextResponse } from 'next/server';
import { deleteAttributeField, updateCatalogFieldRequired, updateCatalogFieldSpan, updateOpsField } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; fieldId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, fieldId } = await ctx.params;
  const body = await req.json();
  try {
    if (typeof body.required === 'boolean' && body.labelPt === undefined) {
      await updateCatalogFieldRequired(id, fieldId, body.required);
    } else if (body.labelPt === undefined) {
      await updateCatalogFieldSpan(id, fieldId, Number(body.span));
    } else {
      await updateOpsField(id, fieldId, {
        labelPt: typeof body.labelPt === 'string' ? body.labelPt : undefined,
        labelEn: typeof body.labelEn === 'string' ? body.labelEn : undefined,
        options: Array.isArray(body.options) ? body.options : undefined,
        optionsText: typeof body.optionsText === 'string' ? body.optionsText : undefined,
        filterable: Boolean(body.filterable),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string; fieldId: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id, fieldId } = await ctx.params;
  try {
    await deleteAttributeField(id, fieldId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
