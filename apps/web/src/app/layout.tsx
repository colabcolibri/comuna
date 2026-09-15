import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { IBM_Plex_Sans } from 'next/font/google';
import { ThemeProvider } from '@community/ui';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { MemberShell } from '@/components/app/MemberShell';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { getMemberSession } from '@/lib/server/member-session';
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
  return (
    <html lang={locale === 'en' ? 'en' : 'pt-BR'} className={`${ibmPlex.variable} h-full`} suppressHydrationWarning>
      <body className={`${ibmPlex.className} min-h-full antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <MemberShell sessionEmail={session?.email ?? null}>{children}</MemberShell>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
