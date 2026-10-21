import { redirect, notFound } from 'next/navigation';
import { ShowcasePanel } from '@/components/app/ShowcasePanel';
import { CommunityJoinBar } from '@/components/app/CommunityJoinBar';
import { listPublicProfiles } from '@/lib/server/public-profiles';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE, resolveUiLocale } from '@community/identity';
import { getCommunityBySlug, publicShowcaseHero } from '@community/communities';
import { extrasFromSearchParams, facetsFromSearchParams, searchParamsFromRecord } from '@/lib/people/directory-query';

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
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const hero = publicShowcaseHero(community, locale);
  return (
    <ShowcasePanel
      communityName={hero.title}
      communityLede={hero.lede || undefined}
      rows={listed.data}
      facets={listed.facets}
      listFields={listed.listFields}
      search={query.get('search') || ''}
      facetValues={facetsFromSearchParams(query)}
      extras={extrasFromSearchParams(query)}
      countries={listed.countries || []}
      page={listed.meta.page}
      pageSize={listed.meta.pageSize}
      total={listed.meta.total}
      talentFilterEnabled={listed.meta.talentFilterEnabled}
      talentCategories={listed.meta.talentCategories}
      lead={<CommunityJoinBar communityId={community.id} slug={community.slug} tone="hero" />}
    />
  );
}
