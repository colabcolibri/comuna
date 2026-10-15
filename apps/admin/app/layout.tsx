import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { IBM_Plex_Sans } from 'next/font/google';
import { ThemeProvider, Toaster } from '@community/ui';
import { THEME_COLOR_COOKIE, themeClassFromCookie } from '@community/ui/theme-init';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { DemoRibbon } from '@/components/demo-ribbon';
import { DemoWriteNotice } from '@/components/demo-write-notice';
import { LocaleProvider } from '@/components/locale-provider';
import { isDatabaseReadOnly } from '@/lib/read-only';
import { memberSurfaceUrl } from '@/lib/surface-urls';
import { uiCatalog } from '@/lang/catalog';
import './globals.css';

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-sans',
});

const META = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'meta.title',
  description: 'meta.description',
  ribbon: 'demo.ribbon',
  toSite: 'demo.to_site',
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(META, locale);
  return { title: copy.title, description: copy.description };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const locale = resolveUiLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const themeClass = themeClassFromCookie(cookieStore.get(THEME_COLOR_COOKIE)?.value);
  const copy = pickContent(META, locale);
  return (
    <html
      lang={locale === 'en' ? 'en' : 'pt-BR'}
      className={`${ibmPlex.variable} ${themeClass ?? ''} h-dvh overflow-hidden`}
      style={themeClass ? { colorScheme: themeClass } : undefined}
      suppressHydrationWarning
    >
      <body className={`${ibmPlex.className} flex h-dvh min-h-0 flex-col overflow-hidden antialiased bg-background text-foreground`}>
        {isDatabaseReadOnly() ? (
          <DemoRibbon label={copy.ribbon} href={memberSurfaceUrl()} linkLabel={copy.toSite} />
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ThemeProvider>
            <LocaleProvider initialLocale={locale}>
              {children}
              {isDatabaseReadOnly() ? <DemoWriteNotice /> : null}
              <Toaster />
            </LocaleProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
