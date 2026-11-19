import { NextRequest, NextResponse } from 'next/server';
import { withAppContext } from '@community/db';
import { talentContribution } from '@community/talent';
import { memberCommunityFromRequest } from '@/lib/server/member-community';
import { moduleRuntime } from '@/lib/server/membership';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const resolved = await memberCommunityFromRequest(req);
  if (resolved.ok === false) {
    return resolved.response;
  }
  const on = await moduleRuntime.isEnabled(resolved.seat.id, talentContribution.slug);
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const { id } = await ctx.params;
  const member = { userId: resolved.userId, communityId: resolved.seat.id };
  const found = await withAppContext(member, async (client) => {
    const owned = await client.query(
      `SELECT id FROM plugin_talent.offerings WHERE id = $1 AND membership_id = $2 FOR UPDATE`,
      [id, resolved.seat.membership_id]
    );
    if (!owned.rows[0]) {
      return false;
    }
    await client.query(
      `UPDATE plugin_talent.offerings SET featured_on_card = false WHERE membership_id = $1 AND featured_on_card`,
      [resolved.seat.membership_id]
    );
    await client.query(
      `UPDATE plugin_talent.offerings SET featured_on_card = true WHERE id = $1 AND membership_id = $2`,
      [id, resolved.seat.membership_id]
    );
    return true;
  });
  if (!found) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Oferta não encontrada' } }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
