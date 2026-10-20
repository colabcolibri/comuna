import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { IBM_Plex_Sans } from 'next/font/google';
import { ThemeProvider, Toaster } from '@community/ui';
import { THEME_COLOR_COOKIE, themeClassFromCookie } from '@community/ui/theme-init';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { listPublicCommunities } from '@community/communities';
import { listMyCommunities } from '@community/memberships';
import { WorkspaceModules } from '@/components/app/EnabledModulesProvider';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { DemoRibbon } from '@/components/app/DemoRibbon';
import { DemoWriteNotice } from '@/components/app/DemoWriteNotice';
import { isDatabaseReadOnly } from '@/lib/read-only';
import { opsSurfaceUrl } from '@/lib/surface-urls';
import { getMemberSession } from '@/lib/server/member-session';
import { moduleRuntime, viewerEnabledSlugs } from '@/lib/server/membership';
import { uiCatalog } from '@/lang/catalog';
import './globals.css';

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-sans',
});

const META = contentFromCatalog(uiCatalog, 'core_web', {
  title: 'meta.title',
  description: 'meta.description',
  ribbon: 'demo.ribbon',
  toOps: 'demo.to_ops',
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(META, locale);
  return { title: copy.title, description: copy.description };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getMemberSession();
  const cookieStore = await cookies();
  const locale = resolveUiLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const themeClass = themeClassFromCookie(cookieStore.get(THEME_COLOR_COOKIE)?.value);
  const copy = pickContent(META, locale);
  const publicEnabled = await viewerEnabledSlugs(null);
  const seats = session ? await listMyCommunities(session.sub) : [];
  const publics = await listPublicCommunities();
  const enabledBySlug: Record<string, string[]> = {};
  await Promise.all([
    ...seats.map(async (seat) => {
      enabledBySlug[seat.slug] = await moduleRuntime.listEnabled(seat.id);
    }),
    ...publics.map(async (community) => {
      if (!enabledBySlug[community.slug]) {
        enabledBySlug[community.slug] = await moduleRuntime.listEnabled(community.id);
      }
    }),
  ]);
  return (
    <html
      lang={locale === 'en' ? 'en' : 'pt-BR'}
      className={`${ibmPlex.variable} ${themeClass ?? ''} h-dvh overflow-hidden`}
      style={themeClass ? { colorScheme: themeClass } : undefined}
      suppressHydrationWarning
    >
      <body className={`${ibmPlex.className} flex h-dvh min-h-0 flex-col overflow-hidden antialiased bg-background text-foreground`}>
        {isDatabaseReadOnly() ? (
          <DemoRibbon label={copy.ribbon} href={opsSurfaceUrl()} linkLabel={copy.toOps} />
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ThemeProvider>
            <LocaleProvider initialLocale={locale}>
              <WorkspaceModules enabledBySlug={enabledBySlug} publicEnabled={publicEnabled}>
                {children}
                {isDatabaseReadOnly() ? <DemoWriteNotice /> : null}
                <Toaster />
              </WorkspaceModules>
            </LocaleProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
