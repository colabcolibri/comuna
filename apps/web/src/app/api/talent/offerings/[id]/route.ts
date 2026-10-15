import { NextRequest, NextResponse } from 'next/server';
import { queryAsMember } from '@community/db';
import { parseOffering, talentContribution } from '@community/talent';
import { memberCommunityFromRequest } from '@/lib/server/member-community';
import { moduleRuntime } from '@/lib/server/membership';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return resolved.response;
  }
  const on = await moduleRuntime.isEnabled(resolved.seat.id, talentContribution.slug);
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const { id } = await ctx.params;
  const parsed = parseOffering(await req.json());
  if (!parsed.ok) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.message } }, { status: 400 });
  }
  const value = parsed.value;
  const updated = await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `UPDATE plugin_talent.offerings
     SET title = $3, description = $4, url = $5, category_id = $6, category_other = $7, audience = $8
     WHERE id = $1 AND membership_id = $2
     RETURNING id`,
    [
      id,
      resolved.seat.membership_id,
      value.title,
      value.description,
      value.url,
      value.categoryId,
      value.categoryOther,
      value.audience,
    ]
  );
  if (!updated.rows[0]) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Oferta não encontrada' } }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return resolved.response;
  }
  const on = await moduleRuntime.isEnabled(resolved.seat.id, talentContribution.slug);
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const { id } = await ctx.params;
  const removed = await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `DELETE FROM plugin_talent.offerings WHERE id = $1 AND membership_id = $2 RETURNING id`,
    [id, resolved.seat.membership_id]
  );
  if (!removed.rows[0]) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Oferta não encontrada' } }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
