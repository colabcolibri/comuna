import { notFound } from 'next/navigation';
import { getCommunity } from '@community/communities';
import { CommunityDetail } from '@/components/community-detail';

export const dynamic = 'force-dynamic';

export default async function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const community = await getCommunity(id);
  if (!community) {
    notFound();
  }
  return <CommunityDetail communityId={community.id} name={community.name} slug={community.slug} />;
}
