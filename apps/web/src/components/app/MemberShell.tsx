'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarInset, SidebarProvider, SidebarTrigger, ThemeToggle } from '@community/ui';
import { pickContent } from '@community/identity';
import { AppSidebar } from '@/components/app/AppSidebar';
import { LocaleSwitcher } from '@/components/app/LocaleSwitcher';
import { useLocale } from '@/components/app/LocaleProvider';
import MemberFooter from '@/components/app/MemberFooter';
import Link from 'next/link';

const CONTENT = {
  'pt-BR': {
    showcase: 'Vitrine',
    toggle: 'Abrir ou fechar menu',
  },
  en: {
    showcase: 'Showcase',
    toggle: 'Toggle menu',
  },
} as const;

export function MemberShell({
  sessionEmail,
  children,
}: {
  sessionEmail: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());

  if (pathname.startsWith('/ops')) {
    return <>{children}</>;
  }

  const showcaseActive = pathname.startsWith('/showcase');

  return (
    <SidebarProvider className="min-h-svh">
      <AppSidebar email={sessionEmail} />
      <SidebarInset className="min-h-svh">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-card px-4 sm:px-6">
          <SidebarTrigger className="size-11" aria-label={copy.toggle} />
          <Link
            href="/showcase"
            className={`inline-flex items-center min-h-11 px-2 text-base ${
              showcaseActive ? 'text-foreground border-b-2 border-mark' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {copy.showcase}
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>
        {children}
        <MemberFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
