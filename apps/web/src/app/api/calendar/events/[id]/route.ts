import { NextRequest, NextResponse } from 'next/server';
import { calendarContribution, parseCalendarEvent } from '@community/calendar';
import { queryAsMember } from '@community/db';
import { memberCommunityFromRequest } from '@/lib/server/member-community';
import { moduleRuntime } from '@/lib/server/membership';

async function gate(req: NextRequest) {
  const resolved = await memberCommunityFromRequest(req);
  if (resolved.ok === false) {
    return { ok: false as const, response: resolved.response };
  }
  const on = await moduleRuntime.isEnabled(resolved.seat.id, calendarContribution.slug);
  if (!on) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 }),
    };
  }
  return { ok: true as const, resolved };
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gated = await gate(req);
  if (!gated.ok) return gated.response;
  const { resolved } = gated;
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'JSON inválido' } }, { status: 400 });
  }

  const parsed = parseCalendarEvent({
    title: String(body.title ?? ''),
    description: typeof body.description === 'string' ? body.description : '',
    startsAt: String(body.startsAt ?? ''),
    endsAt: typeof body.endsAt === 'string' ? body.endsAt : null,
    format: typeof body.format === 'string' ? body.format : 'online',
    location: typeof body.location === 'string' ? body.location : '',
    meetingUrl: typeof body.meetingUrl === 'string' ? body.meetingUrl : null,
  });

  if (parsed.ok === false) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.error } }, { status: 400 });
  }

  const v = parsed.value;
  const isCoordinator = resolved.seat.network_role === 'coordinator';
  const updated = await queryAsMember<{ id: string }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `UPDATE plugin_calendar.events
     SET title = $3,
         description = $4,
         starts_at = $5,
         ends_at = $6,
         format = $7,
         location = $8,
         meeting_url = $9,
         updated_at = now()
     WHERE id = $1
       AND community_id = $2
       AND ($10::boolean OR creator_membership_id = $11)
     RETURNING id`,
    [
      id,
      resolved.seat.id,
      v.title,
      v.description,
      v.startsAt,
      v.endsAt,
      v.format,
      v.location,
      v.meetingUrl,
      isCoordinator,
      resolved.seat.membership_id,
    ]
  );

  if (!updated.rows[0]) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Evento não encontrado' } }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gated = await gate(req);
  if (!gated.ok) return gated.response;
  const { resolved } = gated;
  const { id } = await ctx.params;
  const isCoordinator = resolved.seat.network_role === 'coordinator';

  const deleted = await queryAsMember<{ id: string }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `DELETE FROM plugin_calendar.events
     WHERE id = $1
       AND community_id = $2
       AND ($3::boolean OR creator_membership_id = $4)
     RETURNING id`,
    [id, resolved.seat.id, isCoordinator, resolved.seat.membership_id]
  );

  if (!deleted.rows[0]) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Evento não encontrado' } }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
