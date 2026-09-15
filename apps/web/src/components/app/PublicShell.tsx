'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { AppPublicChrome } from '@community/ui-member';
import type { CommunityRow } from '@community/communities';
import type { MyCommunity } from '@community/memberships';
import { LocaleSwitcher } from '@/components/app/LocaleSwitcher';
import { useLocale } from '@/components/app/LocaleProvider';
import MemberFooter from '@/components/app/MemberFooter';
import { uiCatalog } from '@/lang/catalog';
import { communityPath, slugFromPathname } from '@/lib/people/community-path';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  brand: 'chrome.brand',
  signin: 'chrome.signin',
  community: 'chrome.community',
  toDark: 'theme.to_dark',
  toLight: 'theme.to_light',
});

export function PublicShell({
  signedIn,
  seats,
  publics,
  children,
}: {
  signedIn: boolean;
  seats: MyCommunity[];
  publics: CommunityRow[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const copy = pickContent(CONTENT, useLocale());
  const slug = slugFromPathname(pathname);
  const listed = publics.find((community) => community.slug === slug);
  const seat = seats.find((item) => item.slug === slug);
  const brand = listed?.name || seat?.name || copy.brand;
  const brandHref = slug ? communityPath(slug, '/showcase') : '/showcase';
  const next = pathname || '/showcase';
  const communityHref = seat ? communityPath(seat.slug, '/directory') : seats[0] ? communityPath(seats[0].slug, '/directory') : '/';

  const initial = brand.trim().charAt(0).toUpperCase() || 'C';

  const onLogin = pathname.startsWith('/login');

  return (
    <AppPublicChrome
      wordmark={
        <Link href={brandHref} className="flex min-w-0 items-center gap-2 text-foreground">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            {initial}
          </span>
          <span className="truncate font-semibold tracking-tight">{brand}</span>
        </Link>
      }
      tools={
        <>
          <LocaleSwitcher />
          <ThemeToggle className="size-8" toDark={copy.toDark} toLight={copy.toLight} />
        </>
      }
      action={
        signedIn ? (
          <Link
            href={communityHref}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            {copy.community}
          </Link>
        ) : onLogin ? null : (
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            {copy.signin}
          </Link>
        )
      }
    >
      {children}
      <MemberFooter />
    </AppPublicChrome>
  );
}
