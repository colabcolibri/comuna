import { findMyMembership } from '@community/memberships';
import { JoinCta } from '@/components/app/JoinCta';
import { getMemberSession } from '@/lib/server/member-session';

export async function CommunityJoinBar({ communityId, slug }: { communityId: string; slug: string }) {
  const session = await getMemberSession();
  const seat = session ? await findMyMembership(communityId, session.sub) : null;
  return <JoinCta slug={slug} signedIn={Boolean(session)} status={seat?.network_status ?? null} />;
}
