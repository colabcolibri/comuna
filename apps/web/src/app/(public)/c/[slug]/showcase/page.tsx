import { redirect, notFound } from 'next/navigation';
import { ShowcasePanel } from '@/components/app/ShowcasePanel';
import { CommunityJoinBar } from '@/components/app/CommunityJoinBar';
import { listPublicProfiles } from '@/lib/server/public-profiles';
import { getCommunityBySlug, publicShowcaseHero } from '@community/communities';
import { facetsFromSearchParams, searchParamsFromRecord } from '@/lib/people/directory-query';

export default async function CommunityShowcasePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) {
    notFound();
  }
  const query = searchParamsFromRecord(await searchParams);
  const listed = await listPublicProfiles(community.id, query);
  if (listed.status === 404) {
    redirect('/');
  }
  const hero = publicShowcaseHero(community);
  return (
    <ShowcasePanel
      communityName={hero.title}
      communityLede={hero.lede || undefined}
      rows={listed.data}
      facets={listed.facets}
      listFields={listed.listFields}
      search={query.get('search') || ''}
      facetValues={facetsFromSearchParams(query)}
      status={query.get('status') || ''}
      page={listed.meta.page}
      pageSize={listed.meta.pageSize}
      total={listed.meta.total}
      lead={<CommunityJoinBar communityId={community.id} slug={community.slug} tone="hero" />}
    />
  );
}
