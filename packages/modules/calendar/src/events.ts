export type EventFormat = 'online' | 'in_person' | 'hybrid';
export type RsvpStatus = 'going' | 'interested';

export type CalendarEventInput = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string | null;
  format?: string;
  location?: string;
  meetingUrl?: string | null;
};

export type ParsedCalendarEvent = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  format: EventFormat;
  location: string;
  meetingUrl: string | null;
};

export type CalendarEventError =
  | 'title_required'
  | 'starts_at_invalid'
  | 'ends_at_before_start'
  | 'meeting_url_invalid'
  | 'format_invalid';

const FORMATS = new Set<EventFormat>(['online', 'in_person', 'hybrid']);

function normalizeHttpsUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)
    ? trimmed
    : trimmed.includes('.') && !trimmed.includes(' ')
      ? `https://${trimmed}`
      : trimmed;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' || !parsed.hostname.includes('.')) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function parseCalendarEvent(
  input: CalendarEventInput
): { ok: true; value: ParsedCalendarEvent } | { ok: false; error: CalendarEventError } {
  const title = (input.title || '').trim().slice(0, 120);
  if (!title) {
    return { ok: false, error: 'title_required' };
  }

  const startMs = Date.parse(input.startsAt || '');
  if (!Number.isFinite(startMs)) {
    return { ok: false, error: 'starts_at_invalid' };
  }
  const startsAt = new Date(startMs).toISOString();

  let endsAt: string | null = null;
  const rawEnd = (input.endsAt ?? '').trim();
  if (rawEnd) {
    const endMs = Date.parse(rawEnd);
    if (!Number.isFinite(endMs) || endMs < startMs) {
      return { ok: false, error: 'ends_at_before_start' };
    }
    endsAt = new Date(endMs).toISOString();
  }

  const rawFormat = (input.format || 'online').trim() as EventFormat;
  if (!FORMATS.has(rawFormat)) {
    return { ok: false, error: 'format_invalid' };
  }

  const rawUrl = (input.meetingUrl ?? '').trim();
  let meetingUrl: string | null = null;
  if (rawUrl) {
    meetingUrl = normalizeHttpsUrl(rawUrl);
    if (!meetingUrl) {
      return { ok: false, error: 'meeting_url_invalid' };
    }
  }

  return {
    ok: true,
    value: {
      title,
      description: (input.description || '').trim().slice(0, 2000),
      startsAt,
      endsAt,
      format: rawFormat,
      location: (input.location || '').trim().slice(0, 200),
      meetingUrl,
    },
  };
}

function formatIcsUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function buildIcsContent(event: {
  id: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
}): string {
  const startIso = new Date(event.startsAt).toISOString();
  const endIso = event.endsAt
    ? new Date(event.endsAt).toISOString()
    : new Date(Date.parse(startIso) + 60 * 60 * 1000).toISOString();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Comuna//Calendar//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@comuna`,
    `DTSTAMP:${formatIcsUtc(new Date().toISOString())}`,
    `DTSTART:${formatIcsUtc(startIso)}`,
    `DTEND:${formatIcsUtc(endIso)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];

  const descParts = [event.description?.trim(), event.meetingUrl?.trim()].filter(Boolean) as string[];
  if (descParts.length) {
    lines.push(`DESCRIPTION:${escapeIcsText(descParts.join('\n\n'))}`);
  }
  const loc = event.location?.trim() || event.meetingUrl?.trim();
  if (loc) {
    lines.push(`LOCATION:${escapeIcsText(loc)}`);
  }
  if (event.meetingUrl?.trim()) {
    lines.push(`URL:${event.meetingUrl.trim()}`);
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}

type CalendarLinkInput = {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
};

function resolvedRange(event: CalendarLinkInput) {
  const startIso = new Date(event.startsAt).toISOString();
  const endIso = event.endsAt
    ? new Date(event.endsAt).toISOString()
    : new Date(Date.parse(startIso) + 60 * 60 * 1000).toISOString();
  const details = [event.description?.trim(), event.meetingUrl?.trim()].filter(Boolean).join('\n\n');
  const location = event.location?.trim() || event.meetingUrl?.trim() || '';
  return { startIso, endIso, details, location };
}

export function buildGoogleCalendarUrl(event: CalendarLinkInput): string {
  const { startIso, endIso, details, location } = resolvedRange(event);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatIcsUtc(startIso)}/${formatIcsUtc(endIso)}`,
  });
  if (details) params.set('details', details);
  if (location) params.set('location', location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildOutlookCalendarUrl(event: CalendarLinkInput): string {
  const { startIso, endIso, details, location } = resolvedRange(event);
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startIso,
    enddt: endIso,
  });
  if (details) params.set('body', details);
  if (location) params.set('location', location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
