import { NextRequest, NextResponse } from 'next/server';
import { calendarContribution, parseCalendarEvent } from '@community/calendar';
import { queryAsMember } from '@community/db';
import { memberCommunityFromRequest } from '@/lib/server/member-community';
import { moduleRuntime } from '@/lib/server/membership';
import { listCalendarEvents } from '@/lib/server/calendar-events';

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

export async function GET(req: NextRequest) {
  const gated = await gate(req);
  if (!gated.ok) return gated.response;
  const { resolved } = gated;
  const events = await listCalendarEvents(
    { userId: resolved.userId, communityId: resolved.seat.id },
    resolved.seat.membership_id,
    resolved.seat.network_role === 'coordinator'
  );
  return NextResponse.json({ data: events });
}

export async function POST(req: NextRequest) {
  const gated = await gate(req);
  if (!gated.ok) return gated.response;
  const { resolved } = gated;

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
  const inserted = await queryAsMember<{ id: string }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `INSERT INTO plugin_calendar.events
       (community_id, creator_membership_id, title, description, starts_at, ends_at, format, location, meeting_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      resolved.seat.id,
      resolved.seat.membership_id,
      v.title,
      v.description,
      v.startsAt,
      v.endsAt,
      v.format,
      v.location,
      v.meetingUrl,
    ]
  );

  return NextResponse.json({ id: inserted.rows[0]?.id }, { status: 201 });
}
