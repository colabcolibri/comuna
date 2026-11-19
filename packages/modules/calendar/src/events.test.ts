import { describe, expect, it } from 'vitest';
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildOutlookCalendarUrl,
  calendarContribution,
  parseCalendarEvent,
} from './index';

describe('calendar module', () => {
  it('exposes sidebar contribution on /calendar', () => {
    expect(calendarContribution.slug).toBe('calendar');
    expect(calendarContribution.routes).toEqual([{ path: '/calendar' }]);
    expect(calendarContribution.chrome[0]?.href).toBe('/calendar');
  });

  it('validates event input and normalizes bare https meeting links', () => {
    const res = parseCalendarEvent({
      title: 'Roda de Conversa GSA',
      description: 'Encontro mensal',
      startsAt: '2026-12-01T19:00:00.000Z',
      endsAt: '2026-12-01T20:30:00.000Z',
      format: 'online',
      meetingUrl: 'meet.google.com/abc-defg-hij',
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.meetingUrl).toBe('https://meet.google.com/abc-defg-hij');
      expect(res.value.format).toBe('online');
    }
  });

  it('rejects missing title, end before start, and insecure meeting URLs', () => {
    expect(parseCalendarEvent({ title: '  ', startsAt: '2026-12-01T19:00:00.000Z' })).toEqual({
      ok: false,
      error: 'title_required',
    });
    expect(
      parseCalendarEvent({
        title: 'Evento',
        startsAt: '2026-12-01T19:00:00.000Z',
        endsAt: '2026-12-01T18:00:00.000Z',
      })
    ).toEqual({
      ok: false,
      error: 'ends_at_before_start',
    });
    expect(
      parseCalendarEvent({
        title: 'Evento',
        startsAt: '2026-12-01T19:00:00.000Z',
        meetingUrl: 'http://insecure.example.com',
      })
    ).toEqual({
      ok: false,
      error: 'meeting_url_invalid',
    });
  });

  it('builds valid RFC 5545 ICS content', () => {
    const ics = buildIcsContent({
      id: 'evt-1',
      title: 'Encontro, GSA',
      description: 'Linha 1\nLinha 2',
      startsAt: '2026-12-01T19:00:00.000Z',
      location: 'São Paulo',
      meetingUrl: 'https://meet.google.com/xyz',
    });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('UID:evt-1@comuna');
    expect(ics).toContain('DTSTART:20261201T190000Z');
    expect(ics).toContain('DTEND:20261201T200000Z');
    expect(ics).toContain('SUMMARY:Encontro\\, GSA');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('builds Google Calendar and Outlook Web deep links', () => {
    const sample = {
      title: 'Roda GSA',
      description: 'Pauta mensal',
      startsAt: '2026-12-01T19:00:00.000Z',
      endsAt: '2026-12-01T20:30:00.000Z',
      location: 'São Paulo',
      meetingUrl: 'https://meet.google.com/xyz',
    };
    const google = new URL(buildGoogleCalendarUrl(sample));
    expect(google.origin).toBe('https://calendar.google.com');
    expect(google.searchParams.get('action')).toBe('TEMPLATE');
    expect(google.searchParams.get('text')).toBe('Roda GSA');
    expect(google.searchParams.get('dates')).toBe('20261201T190000Z/20261201T203000Z');
    expect(google.searchParams.get('location')).toBe('São Paulo');

    const outlook = new URL(buildOutlookCalendarUrl(sample));
    expect(outlook.origin).toBe('https://outlook.live.com');
    expect(outlook.searchParams.get('subject')).toBe('Roda GSA');
    expect(outlook.searchParams.get('startdt')).toBe('2026-12-01T19:00:00.000Z');
    expect(outlook.searchParams.get('enddt')).toBe('2026-12-01T20:30:00.000Z');
  });
});
