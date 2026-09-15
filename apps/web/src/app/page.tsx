import Link from 'next/link';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { AppPageTemplate } from '@community/ui-member';
import { getMemberSession } from '@/lib/server/member-session';
import { viewerEnabledSlugs } from '@/lib/server/membership';
import { uiCatalog } from '@/lang/catalog';
import { copyFrom, visibleChrome } from '@/modules/registry';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  kicker: 'home.kicker',
  title: 'home.title',
  subtitle: 'home.subtitle',
  signin: 'home.signin',
  directory: 'home.directory',
  showcase: 'home.showcase',
  profile: 'chrome.profile',
});

const ctaClass =
  'inline-flex items-center justify-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium';
const outlineClass =
  'inline-flex items-center justify-center min-h-11 px-5 rounded-lg border border-border text-sm';

export default async function HomePage() {
  const session = await getMemberSession();
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);
  const enabled = await viewerEnabledSlugs(session?.sub ?? null);
  const signedIn = Boolean(session);
  const memberHome = visibleChrome(enabled, 'home', signedIn).filter((item) => item.memberOnly);
  const publicHome = visibleChrome(enabled, 'home', signedIn).filter((item) => !item.memberOnly);

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {signedIn ? (
          memberHome.length > 0 ? (
            memberHome.map((item) => (
              <Link key={item.href} href={item.href} className={ctaClass}>
                {copyFrom(copy, item.copyKey)}
              </Link>
            ))
          ) : (
            <Link href="/profile/edit" className={ctaClass}>
              {copy.profile}
            </Link>
          )
        ) : (
          <Link href="/login" className={ctaClass}>
            {copy.signin}
          </Link>
        )}
        {publicHome.map((item) => (
          <Link key={item.href} href={item.href} className={outlineClass}>
            {copyFrom(copy, item.copyKey)}
          </Link>
        ))}
      </div>
    </AppPageTemplate>
  );
}
