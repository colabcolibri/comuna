import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { listPublicCommunities, publicShowcaseHero } from '@community/communities';
import { AppShowcaseEmpty, AppShowcasePortal } from '@community/ui-member';
import { ShowcasePanel } from '@/components/app/ShowcasePanel';
import { CommunityJoinBar } from '@/components/app/CommunityJoinBar';
import { listPublicProfiles } from '@/lib/server/public-profiles';
import { uiCatalog } from '@/lang/catalog';
import { communityPath } from '@/lib/people/community-path';
import { extrasFromSearchParams, facetsFromSearchParams, searchParamsFromRecord } from '@/lib/people/directory-query';
import Link from 'next/link';

const CONTENT = contentFromCatalog(uiCatalog, 'plugin_showcase', {
  title: 'page.title',
  pick: 'page.pick',
  pickSubtitle: 'page.pick_subtitle',
  emptyTitle: 'page.empty_title',
  empty: 'page.empty',
});

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);
  const communities = await listPublicCommunities();
  const query = searchParamsFromRecord(await searchParams);
  if (communities.length === 1) {
    const community = communities[0];
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
        extras={extrasFromSearchParams(query)}
        countries={listed.countries || []}
        page={listed.meta.page}
        pageSize={listed.meta.pageSize}
        total={listed.meta.total}
        lead={<CommunityJoinBar communityId={community.id} slug={community.slug} tone="hero" />}
      />
    );
  }
  if (communities.length === 0) {
    return (
      <AppShowcasePortal title={copy.title} lede={copy.pickSubtitle}>
        <AppShowcaseEmpty title={copy.emptyTitle} body={copy.empty} />
      </AppShowcasePortal>
    );
  }
  return (
    <AppShowcasePortal title={copy.pick} lede={copy.pickSubtitle}>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {communities.map((community) => {
          const hero = publicShowcaseHero(community);
          return (
            <li key={community.id} className="min-w-0">
              <Link
                href={communityPath(community.slug, '/showcase')}
                className="flex h-full min-h-28 min-w-0 flex-col rounded-2xl border border-border bg-card p-5 hover:border-foreground/20 hover:bg-accent/30"
              >
                <span className="text-lg font-semibold tracking-tight">{hero.title}</span>
                {hero.lede ? (
                  <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{hero.lede}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShowcasePortal>
  );
}
