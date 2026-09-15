'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollArea, SidebarInset, SidebarProvider, SidebarTrigger, ThemeToggle } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { AppSidebar } from '@/components/app/AppSidebar';
import { LocaleSwitcher } from '@/components/app/LocaleSwitcher';
import { useLocale } from '@/components/app/LocaleProvider';
import MemberFooter from '@/components/app/MemberFooter';
import { uiCatalog } from '@/lang/catalog';
import Link from 'next/link';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  brand: 'chrome.brand',
  showcase: 'chrome.showcase',
  toggle: 'chrome.open_menu',
  toDark: 'theme.to_dark',
  toLight: 'theme.to_light',
});

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
    <SidebarProvider className="h-svh max-h-svh overflow-hidden">
      <AppSidebar email={sessionEmail} />
      <SidebarInset className="h-svh max-h-svh min-h-0 overflow-hidden">
        <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-card">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
          <SidebarTrigger className="size-11 shrink-0 md:hidden" aria-label={copy.toggle} />
          <Link
            href="/showcase"
            className="flex min-h-11 min-w-0 items-center gap-2 px-1 text-foreground hover:text-foreground"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              A
            </span>
            <span className="truncate font-semibold tracking-tight">{copy.brand}</span>
          </Link>
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
            <ThemeToggle toDark={copy.toDark} toLight={copy.toLight} />
          </div>
          </div>
        </header>
        <ScrollArea type="always" className="member-page-scroll min-h-0 flex-1">
          {children}
        </ScrollArea>
        <MemberFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
