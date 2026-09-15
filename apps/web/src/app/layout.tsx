import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies, headers } from 'next/headers';
import { IBM_Plex_Sans } from 'next/font/google';
import { ThemeProvider, Toaster } from '@community/ui';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { listMyCommunities, pickCommunitySeat } from '@community/memberships';
import { MemberShell } from '@/components/app/MemberShell';
import { EnabledModulesProvider } from '@/components/app/EnabledModulesProvider';
import { LocaleProvider } from '@/components/app/LocaleProvider';
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
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(META, locale);
  return { title: copy.title, description: copy.description };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getMemberSession();
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const slug = (await headers()).get('x-community-slug');
  let enabledModules = await viewerEnabledSlugs(null);
  let workspace: { current: Awaited<ReturnType<typeof listMyCommunities>>[0]; seats: Awaited<ReturnType<typeof listMyCommunities>> } | null =
    null;
  if (session && slug) {
    const seats = await listMyCommunities(session.sub);
    const picked = pickCommunitySeat(seats, slug);
    if (picked.ok) {
      enabledModules = await moduleRuntime.listEnabled(picked.seat.id);
      workspace = { current: picked.seat, seats };
    }
  }
  return (
    <html lang={locale === 'en' ? 'en' : 'pt-BR'} className={`${ibmPlex.variable} h-full`} suppressHydrationWarning>
      <body className={`${ibmPlex.className} min-h-full antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <EnabledModulesProvider enabled={enabledModules}>
              <MemberShell sessionEmail={session?.email ?? null} workspace={workspace}>{children}</MemberShell>
              <Toaster />
            </EnabledModulesProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
