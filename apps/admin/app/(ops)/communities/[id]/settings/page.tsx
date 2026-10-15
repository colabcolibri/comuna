import { query } from '@community/db';
import { getCommunity } from '@community/communities';
import { listCommunityModuleStates } from '@community/module-runtime';
import { notFound } from 'next/navigation';
import { CommunitySettings } from '@/components/community-settings';
import { firstPartySlugs } from '@/lib/registry';

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
      isPublicShowcase={community.is_public_showcase}
      settings={community.settings}
      talentOn={(await listCommunityModuleStates(query, community.id, firstPartySlugs)).some(
        (item) => item.slug === 'talent' && item.enabled
      )}
    />
  );
}
