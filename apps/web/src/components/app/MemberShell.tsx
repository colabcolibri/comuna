'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  ScrollArea,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  ThemeToggle,
  useSidebar,
} from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { AppSidebar } from '@/components/app/AppSidebar';
import { LocaleSwitcher } from '@/components/app/LocaleSwitcher';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import MemberFooter from '@/components/app/MemberFooter';
import { uiCatalog } from '@/lang/catalog';
import { copyFrom, visibleChrome } from '@/modules/registry';
import { communityPath, slugFromPathname } from '@/lib/people/community-path';
import type { MyCommunity } from '@community/memberships';
import Link from 'next/link';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  brand: 'chrome.brand',
  showcase: 'chrome.showcase',
  openMenu: 'chrome.open_menu',
  closeMenu: 'chrome.close_menu',
  toDark: 'theme.to_dark',
  toLight: 'theme.to_light',
});

function ShellMenuTrigger({ openLabel, closeLabel }: { openLabel: string; closeLabel: string }) {
  const { state, isMobile, openMobile } = useSidebar();
  const expanded = isMobile ? openMobile : state === 'expanded';
  return <SidebarTrigger className="size-11 shrink-0" aria-label={expanded ? closeLabel : openLabel} />;
}

export function MemberShell({
  sessionEmail,
  seats,
  children,
}: {
  sessionEmail: string | null;
  seats: MyCommunity[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
  const enabled = useEnabledModules();
  const headerNav = visibleChrome(enabled, 'header', Boolean(sessionEmail));
  const slug = slugFromPathname(pathname);
  const current = seats.find((seat) => seat.slug === slug);
  const brand = current?.name ?? copy.brand;
  const initial = brand.trim().charAt(0).toUpperCase() || 'C';
  const showcaseHref = slug ? communityPath(slug, '/showcase') : '/showcase';

  return (
    <SidebarProvider className="h-svh max-h-svh overflow-hidden">
      <AppSidebar email={sessionEmail} seats={seats} />
      <SidebarInset className="h-svh max-h-svh min-h-0 overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-border bg-card">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
          <ShellMenuTrigger openLabel={copy.openMenu} closeLabel={copy.closeMenu} />
          <Link
            href={slug ? communityPath(slug, '/directory') : '/'}
            className="flex min-w-0 items-center gap-2 px-1 text-foreground hover:text-foreground"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {initial}
            </span>
            <span className="truncate font-semibold tracking-tight">{brand}</span>
          </Link>
          {headerNav.map((item) => {
            const active = item.href === '/showcase' && pathname.includes('/showcase');
            return (
          <Link
            key={item.href}
            href={item.href === '/showcase' ? showcaseHref : item.href}
            className={`flex items-center px-2 text-base ${
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="relative">
              {copyFrom(copy, item.copyKey)}
              {active ? (
                <span aria-hidden className="absolute inset-x-0 top-full mt-0.5 h-0.5 bg-mark" />
              ) : null}
            </span>
          </Link>
            );
          })}
          <div className="ml-auto flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle className="size-8" toDark={copy.toDark} toLight={copy.toLight} />
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
