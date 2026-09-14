import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Atkinson_Hyperlegible, Inter } from 'next/font/google';
import { ThemeProvider } from '@community/ui';
import { LOCALE_COOKIE, resolveUiLocale } from '@community/identity';
import MemberHeader from '@/components/app/MemberHeader';
import MemberFooter from '@/components/app/MemberFooter';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { getMemberSession } from '@/lib/server/member-session';
import './globals.css';

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Community',
  description: 'Diretório profissional de comunidades',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getMemberSession();
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return (
    <html lang={locale === 'en' ? 'en' : 'pt-BR'} className={`${atkinson.variable} ${inter.variable} h-full`} suppressHydrationWarning>
      <body className={`${atkinson.className} min-h-full flex flex-col antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <MemberHeader sessionEmail={session?.email ?? null} />
            {children}
            <MemberFooter />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
