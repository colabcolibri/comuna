import { NextRequest, NextResponse } from 'next/server';
import { applyChoiceOptions, previewChoiceOptions, loadChoiceField } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireCommunityOps } from '@/lib/require-ops';

function parseRenames(raw: unknown) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const row = item as { from?: unknown; to?: unknown };
      const from = String(row.from || '').trim();
      const to = String(row.to || '').trim();
      return from && to ? { from, to } : null;
    })
    .filter((item): item is { from: string; to: string } => Boolean(item));
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string; fieldId: string }> }) {
  const { id, fieldId } = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const body = await req.json();
  try {
    const field = await loadChoiceField(id, fieldId);
    if (!field) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Inexistente' } }, { status: 404 });
    }
    const preview = await previewChoiceOptions({
      communityId: id,
      fieldName: field.name,
      fieldType: field.type,
      beforeOptions: field.options,
      options: Array.isArray(body.options) ? body.options : undefined,
      optionsText: typeof body.optionsText === 'string' ? body.optionsText : undefined,
      renames: parseRenames(body.renames),
    });
    return NextResponse.json({ data: preview });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string; fieldId: string }> }) {
  const { id, fieldId } = await ctx.params;
  const ops = await requireCommunityOps(req, id);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const body = await req.json();
  if (body.applyDataMigration !== true) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'applyDataMigration obrigatório' } }, { status: 400 });
  }
  try {
    const preview = await applyChoiceOptions({
      communityId: id,
      fieldId,
      options: Array.isArray(body.options) ? body.options : undefined,
      optionsText: typeof body.optionsText === 'string' ? body.optionsText : undefined,
      renames: parseRenames(body.renames),
      acknowledged: Array.isArray(body.acknowledged) ? body.acknowledged.map(String) : [],
    });
    return NextResponse.json({ ok: true, data: preview });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
