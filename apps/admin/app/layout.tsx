import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { ThemeProvider } from '@community/ui';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { LocaleProvider } from '@/components/locale-provider';
import { uiCatalog } from '@/lang/catalog';
import './globals.css';

const META = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'meta.title',
  description: 'meta.description',
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(META, locale);
  return { title: copy.title, description: copy.description };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return (
    <html lang={locale === 'en' ? 'en' : 'pt-BR'} suppressHydrationWarning>
      <body className="min-h-full antialiased bg-background text-foreground">
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
