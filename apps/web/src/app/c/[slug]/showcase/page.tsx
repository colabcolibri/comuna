import { redirect } from 'next/navigation';
import { ShowcasePanel } from '@/components/app/ShowcasePanel';
import { listPublicProfiles } from '@/lib/server/public-profiles';
import { getCommunityBySlug } from '@community/communities';
import { notFound } from 'next/navigation';

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
  return <ShowcasePanel rows={listed.data} />;
}
