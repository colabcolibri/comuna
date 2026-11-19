import { redirect } from 'next/navigation';
import { calendarContribution } from '@community/calendar';
import { CalendarPanel } from '@/components/app/CalendarPanel';
import { MemberAccessNotice } from '@/components/app/MemberAccessNotice';
import { listCalendarEvents } from '@/lib/server/calendar-events';
import { moduleRuntime } from '@/lib/server/membership';
import { requireMemberForSlug } from '@/lib/server/require-member';

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await requireMemberForSlug(slug);
  if (!member.ok) {
    return <MemberAccessNotice kind="forbidden" />;
  }
  const on = await moduleRuntime.isEnabled(member.ctx.communityId, calendarContribution.slug);
  if (!on) {
    redirect(`/c/${slug}/directory`);
  }
  const events = await listCalendarEvents(
    member.ctx,
    member.seat.membership_id,
    member.seat.network_role === 'coordinator'
  );
  return <CalendarPanel initialEvents={events} />;
}
