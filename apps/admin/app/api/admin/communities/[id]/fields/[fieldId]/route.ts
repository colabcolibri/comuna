import { NextRequest, NextResponse } from 'next/server';
import { deleteAttributeField, updateCatalogFieldDescription, updateCatalogFieldEnabled, updateCatalogFieldLocalized, updateCatalogFieldRequired, updateCatalogFieldSpan, updateOpsField } from '@community/directory/ops';
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
    if (body.exposure === 'hidden' || body.exposure === 'internal' || body.exposure === 'external') {
      const { query } = await import('@community/db');
      await query(
        `UPDATE plugin_directory.fields f
         SET exposure = $3
         FROM plugin_directory.field_groups g
         WHERE f.id = $1 AND f.group_id = g.id AND g.community_id = $2 AND f.exposure IS NOT NULL`,
        [fieldId, id, body.exposure]
      );
    } else if (body.labelPt !== undefined) {
      await updateOpsField(id, fieldId, {
        labelPt: typeof body.labelPt === 'string' ? body.labelPt : undefined,
        labelEn: typeof body.labelEn === 'string' ? body.labelEn : undefined,
        descriptionPt: typeof body.descriptionPt === 'string' ? body.descriptionPt : undefined,
        descriptionEn: typeof body.descriptionEn === 'string' ? body.descriptionEn : undefined,
      });
    } else if (body.descriptionPt !== undefined) {
      await updateCatalogFieldDescription(id, fieldId, {
        descriptionPt: body.descriptionPt,
        descriptionEn: body.descriptionEn,
      });
    } else if (typeof body.enabled === 'boolean') {
      await updateCatalogFieldEnabled(id, fieldId, body.enabled);
    } else if (typeof body.required === 'boolean') {
      await updateCatalogFieldRequired(id, fieldId, body.required);
    } else if (typeof body.localized === 'boolean') {
      await updateCatalogFieldLocalized(id, fieldId, body.localized);
    } else {
      await updateCatalogFieldSpan(id, fieldId, Number(body.span));
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
