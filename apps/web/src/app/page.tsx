import Link from 'next/link';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { AppPageTemplate } from '@community/ui-member';
import { getMemberSession } from '@/lib/server/member-session';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  kicker: 'home.kicker',
  title: 'home.title',
  subtitle: 'home.subtitle',
  signin: 'home.signin',
  directory: 'home.directory',
  showcase: 'home.showcase',
});

export default async function HomePage() {
  const session = await getMemberSession();
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {session ? (
          <Link
            href="/directory"
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            {copy.directory}
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center min-h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            {copy.signin}
          </Link>
        )}
        <Link
          href="/showcase"
          className="inline-flex items-center justify-center min-h-11 px-5 rounded-lg border border-border text-sm"
        >
          {copy.showcase}
        </Link>
      </div>
    </AppPageTemplate>
  );
}
