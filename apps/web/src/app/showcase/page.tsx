import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { listPublicCommunities } from '@community/communities';
import { AppPageTemplate } from '@community/ui-member';
import { ShowcasePanel } from '@/components/app/ShowcasePanel';
import { CommunityJoinBar } from '@/components/app/CommunityJoinBar';
import { listPublicProfiles } from '@/lib/server/public-profiles';
import { uiCatalog } from '@/lang/catalog';
import { communityPath } from '@/lib/people/community-path';
import Link from 'next/link';

const CONTENT = contentFromCatalog(uiCatalog, 'plugin_showcase', {
  kicker: 'page.kicker',
  title: 'page.title',
  pick: 'page.pick',
  pickSubtitle: 'page.pick_subtitle',
  empty: 'page.empty',
});

export default async function ShowcasePage() {
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);
  const communities = await listPublicCommunities();
  if (communities.length === 1) {
    const community = communities[0];
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
  if (communities.length === 0) {
    return (
      <AppPageTemplate kicker={copy.kicker} title={copy.title}>
        <p className="text-muted-foreground">{copy.empty}</p>
      </AppPageTemplate>
    );
  }
  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.pick} subtitle={copy.pickSubtitle}>
      <ul className="grid gap-3">
        {communities.map((community) => (
          <li key={community.id}>
            <Link
              href={communityPath(community.slug, '/showcase')}
              className="flex min-h-11 items-center rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-accent"
            >
              {community.name}
            </Link>
          </li>
        ))}
      </ul>
    </AppPageTemplate>
  );
}
