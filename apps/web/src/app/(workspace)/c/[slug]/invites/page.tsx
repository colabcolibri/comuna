import { redirect } from 'next/navigation';
import { invitationsContribution } from '@community/invitations';
import { AppPageTemplate } from '@community/ui-member';
import { InvitationsPanel } from '@/components/app/InvitationsPanel';
import { MemberAccessNotice } from '@/components/app/MemberAccessNotice';
import { moduleRuntime } from '@/lib/server/membership';
import { requireMemberForSlug } from '@/lib/server/require-member';

export default async function InvitesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await requireMemberForSlug(slug);
  if (!member.ok) {
    return <MemberAccessNotice kind="forbidden" />;
  }
  const on = await moduleRuntime.isEnabled(member.ctx.communityId, invitationsContribution.slug);
  if (!on) {
    redirect(`/c/${slug}/directory`);
  }
  const isCoordinator = member.seat.network_role === 'coordinator';

  return (
    <AppPageTemplate
      kicker="Comunidade"
      title="Convidar pessoas"
      subtitle="Convide novas pessoas para participar desta comunidade."
    >
      <InvitationsPanel endpoint="/api/invitations" showQuota={!isCoordinator} />
    </AppPageTemplate>
  );
}
