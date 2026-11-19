import { NextRequest, NextResponse } from 'next/server';
import { calendarContribution } from '@community/calendar';
import { queryAsMember } from '@community/db';
import { memberCommunityFromRequest } from '@/lib/server/member-community';
import { moduleRuntime } from '@/lib/server/membership';

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const resolved = await memberCommunityFromRequest(req);
  if (resolved.ok === false) {
    return resolved.response;
  }
  const on = await moduleRuntime.isEnabled(resolved.seat.id, calendarContribution.slug);
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }

  const { id } = await ctx.params;
  let body: { status?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'JSON inválido' } }, { status: 400 });
  }

  const status = body.status;
  if (status === null || status === 'none') {
    await queryAsMember(
      { userId: resolved.userId, communityId: resolved.seat.id },
      `DELETE FROM plugin_calendar.rsvps WHERE event_id = $1 AND membership_id = $2`,
      [id, resolved.seat.membership_id]
    );
    return NextResponse.json({ ok: true, status: null });
  }

  if (status !== 'going' && status !== 'interested') {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Status de presença inválido' } }, { status: 400 });
  }

  const exists = await queryAsMember<{ id: string }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT id FROM plugin_calendar.events WHERE id = $1 AND community_id = $2`,
    [id, resolved.seat.id]
  );
  if (!exists.rows[0]) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Evento não encontrado' } }, { status: 404 });
  }

  await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `INSERT INTO plugin_calendar.rsvps (event_id, membership_id, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, membership_id) DO UPDATE SET status = EXCLUDED.status`,
    [id, resolved.seat.membership_id, status]
  );

  return NextResponse.json({ ok: true, status });
}
