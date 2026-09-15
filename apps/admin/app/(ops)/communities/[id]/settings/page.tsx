import { getCommunity } from '@community/communities';
import { notFound } from 'next/navigation';
import { CommunitySettings } from '@/components/community-settings';

export const dynamic = 'force-dynamic';

export default async function CommunitySettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const community = await getCommunity(id);
  if (!community) {
    notFound();
  }
  return (
    <CommunitySettings
      communityId={community.id}
      name={community.name}
      slug={community.slug}
      type={community.type}
    />
  );
}
