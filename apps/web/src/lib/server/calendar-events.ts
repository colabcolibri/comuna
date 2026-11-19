import { queryAsMember } from '@community/db';
import type { EventFormat, RsvpStatus } from '@community/calendar';
import type { AppQueryCtx } from '@/lib/server/app-ctx';

export type CalendarEventItem = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  format: EventFormat;
  location: string;
  meetingUrl: string | null;
  creatorMembershipId: string;
  creatorName: string;
  canEdit: boolean;
  goingCount: number;
  interestedCount: number;
  myRsvp: RsvpStatus | null;
};

type EventRow = {
  id: string;
  title: string;
  description: string;
  starts_at: string | Date;
  ends_at: string | Date | null;
  format: EventFormat;
  location: string;
  meeting_url: string | null;
  creator_membership_id: string;
  creator_name: string | null;
  going_count: number;
  interested_count: number;
  my_rsvp: RsvpStatus | null;
};

export async function listCalendarEvents(
  ctx: AppQueryCtx,
  membershipId: string,
  isCoordinator: boolean
): Promise<CalendarEventItem[]> {
  const res = await queryAsMember<EventRow>(
    ctx,
    `SELECT
       e.id,
       e.title,
       e.description,
       e.starts_at,
       e.ends_at,
       e.format,
       e.location,
       e.meeting_url,
       e.creator_membership_id,
       COALESCE(p.full_name, '') AS creator_name,
       COUNT(r.membership_id) FILTER (WHERE r.status = 'going')::int AS going_count,
       COUNT(r.membership_id) FILTER (WHERE r.status = 'interested')::int AS interested_count,
       MAX(CASE WHEN r.membership_id = $2 THEN r.status ELSE NULL END) AS my_rsvp
     FROM plugin_calendar.events e
     JOIN network_core.memberships m ON m.id = e.creator_membership_id
     LEFT JOIN person_core.profiles p ON p.user_id = m.user_id
     LEFT JOIN plugin_calendar.rsvps r ON r.event_id = e.id
     WHERE e.community_id = $1
     GROUP BY e.id, p.full_name
     ORDER BY e.starts_at ASC, e.id ASC`,
    [ctx.communityId, membershipId]
  );

  return res.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: new Date(row.starts_at).toISOString(),
    endsAt: row.ends_at ? new Date(row.ends_at).toISOString() : null,
    format: row.format,
    location: row.location,
    meetingUrl: row.meeting_url,
    creatorMembershipId: row.creator_membership_id,
    creatorName: row.creator_name || '',
    canEdit: isCoordinator || row.creator_membership_id === membershipId,
    goingCount: Number(row.going_count) || 0,
    interestedCount: Number(row.interested_count) || 0,
    myRsvp: row.my_rsvp ?? null,
  }));
}
