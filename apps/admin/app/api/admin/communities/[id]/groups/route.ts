import { NextRequest, NextResponse } from 'next/server';
import { createCatalogGroup } from '@community/directory/ops';
import { catalogWriteResponse } from '@/lib/catalog-http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { id } = await ctx.params;
  const body = await req.json();
  try {
    const group = await createCatalogGroup(id, {
      slug: typeof body.slug === 'string' ? body.slug : '',
      labelPt: String(body.labelPt || ''),
      labelEn: String(body.labelEn || ''),
      columns: Number(body.columns),
    });
    return NextResponse.json(group, { status: 201 });
  } catch (err) {
    return catalogWriteResponse(err);
  }
}
