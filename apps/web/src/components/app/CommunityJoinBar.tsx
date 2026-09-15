import { findMyMembership } from '@community/memberships';
import { JoinCta } from '@/components/app/JoinCta';
import { getMemberSession } from '@/lib/server/member-session';

export async function CommunityJoinBar({
  communityId,
  slug,
  tone = 'inline',
}: {
  communityId: string;
  slug: string;
  tone?: 'hero' | 'inline';
}) {
  const session = await getMemberSession();
  const seat = session ? await findMyMembership(communityId, session.sub) : null;
  return <JoinCta slug={slug} signedIn={Boolean(session)} status={seat?.network_status ?? null} tone={tone} />;
}
