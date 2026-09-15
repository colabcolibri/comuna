import Link from 'next/link';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { listPublicCommunities } from '@community/communities';
import { listMyCommunities } from '@community/memberships';
import { AppPageTemplate } from '@community/ui-member';
import { getMemberSession } from '@/lib/server/member-session';
import { moduleRuntime } from '@/lib/server/membership';
import { uiCatalog } from '@/lang/catalog';
import { communityPath } from '@/lib/people/community-path';
import { CommunityJoinBar } from '@/components/app/CommunityJoinBar';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  kicker: 'home.kicker',
  title: 'home.title',
  subtitle: 'home.subtitle',
  signin: 'home.signin',
  directory: 'home.directory',
  showcase: 'home.showcase',
  profile: 'chrome.profile',
  communityProfile: 'chrome.community_profile',
  seats: 'home.seats',
  discover: 'home.discover',
  none: 'home.none',
});

const ctaClass =
  'inline-flex items-center justify-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium';
const outlineClass =
  'inline-flex items-center justify-center min-h-11 px-5 rounded-lg border border-border text-sm';

export default async function HomePage() {
  const session = await getMemberSession();
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);
  const seats = session ? await listMyCommunities(session.sub) : [];
  const publics = await listPublicCommunities();
  const enabledBySeat = await Promise.all(seats.map((seat) => moduleRuntime.listEnabled(seat.id)));
  const signedIn = Boolean(session);

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      {!signedIn ? (
        <div className="mb-10 flex flex-col sm:flex-row flex-wrap gap-3">
          <Link href="/login" className={ctaClass}>
            {copy.signin}
          </Link>
          <Link href="/showcase" className={outlineClass}>
            {copy.showcase}
          </Link>
        </div>
      ) : null}

      {signedIn && seats.length === 0 ? <p className="mb-6 text-muted-foreground">{copy.none}</p> : null}

      {seats.length > 0 ? (
        <section className="mb-10 space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">{copy.seats}</h2>
          <ul className="grid gap-3">
            {seats.map((seat, index) => {
              const enabled = new Set(enabledBySeat[index] || []);
              return (
                <li
                  key={seat.id}
                  className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium">{seat.name}</span>
                  <div className="flex flex-wrap gap-2">
                    {enabled.has('directory') ? (
                      <Link href={communityPath(seat.slug, '/directory')} className={ctaClass}>
                        {copy.directory}
                      </Link>
                    ) : null}
                    {enabled.has('showcase') ? (
                      <Link href={communityPath(seat.slug, '/showcase')} className={outlineClass}>
                        {copy.showcase}
                      </Link>
                    ) : null}
                    <Link href={communityPath(seat.slug, '/profile')} className={outlineClass}>
                      {copy.communityProfile}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {publics.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">{copy.discover}</h2>
          <ul className="grid gap-4">
            {publics.map((community) => (
              <li key={community.id} className="min-w-0 rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{community.name}</span>
                  <Link href={communityPath(community.slug, '/showcase')} className={outlineClass}>
                    {copy.showcase}
                  </Link>
                </div>
                <CommunityJoinBar communityId={community.id} slug={community.slug} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppPageTemplate>
  );
}
