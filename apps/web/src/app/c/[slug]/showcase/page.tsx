import { redirect, notFound } from 'next/navigation';
import { ShowcasePanel } from '@/components/app/ShowcasePanel';
import { CommunityJoinBar } from '@/components/app/CommunityJoinBar';
import { listPublicProfiles } from '@/lib/server/public-profiles';
import { getCommunityBySlug } from '@community/communities';

export default async function CommunityShowcasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) {
    notFound();
  }
  const listed = await listPublicProfiles(community.id);
  if (listed.status === 404) {
    redirect('/');
  }
  return (
    <ShowcasePanel
      rows={listed.data}
      lead={<CommunityJoinBar communityId={community.id} slug={community.slug} />}
    />
  );
}
