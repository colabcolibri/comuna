'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@community/ui';
import { OpsShell, type OpsNavGroup } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { LocaleSwitcher } from './locale-switcher';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  brand: 'chrome.brand',
  network: 'chrome.network',
  communities: 'chrome.communities',
  people: 'chrome.people',
  platform: 'chrome.platform',
  emails: 'chrome.emails',
  here: 'chrome.this_community',
  settings: 'community.settings',
  modules: 'community.modules',
  members: 'community.members',
  cohorts: 'community.cohorts',
  fields: 'community.fields',
  lists: 'community.lists',
  signout: 'chrome.signout',
  menu: 'chrome.open_menu',
  toDark: 'theme.to_dark',
  toLight: 'theme.to_light',
});

function tenantIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/communities\/([^/]+)/);
  return match?.[1] ?? null;
}

function chapterActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OpsChrome({ children }: { children: ReactNode }) {
  const copy = pickContent(CONTENT, useLocale());
  const router = useRouter();
  const pathname = usePathname();
  const tenantId = tenantIdFromPath(pathname);
  const groups: OpsNavGroup[] = [
    {
      label: copy.network,
      items: [
        { href: '/communities', label: copy.communities, active: pathname === '/communities' },
        { href: '/people', label: copy.people, active: pathname === '/people' || pathname.startsWith('/people/') },
        { href: '/platform', label: copy.platform, active: pathname === '/platform' || pathname.startsWith('/platform/') },
        { href: '/emails', label: copy.emails, active: pathname === '/emails' || pathname.startsWith('/emails/') },
      ],
    },
  ];
  if (tenantId) {
    const base = `/communities/${tenantId}`;
    groups.push({
      label: copy.here,
      items: [
        { href: `${base}/settings`, label: copy.settings, active: chapterActive(pathname, `${base}/settings`) },
        { href: `${base}/modules`, label: copy.modules, active: chapterActive(pathname, `${base}/modules`) },
        { href: `${base}/members`, label: copy.members, active: chapterActive(pathname, `${base}/members`) },
        { href: `${base}/cohorts`, label: copy.cohorts, active: chapterActive(pathname, `${base}/cohorts`) },
        { href: `${base}/fields`, label: copy.fields, active: chapterActive(pathname, `${base}/fields`) },
        { href: `${base}/lists`, label: copy.lists, active: chapterActive(pathname, `${base}/lists`) },
      ],
    });
  }

  const onSignOut = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <OpsShell
      brand={copy.brand}
      groups={groups}
      linkComponent={Link}
      signOutLabel={copy.signout}
      menuLabel={copy.menu}
      localeSlot={<LocaleSwitcher />}
      themeSlot={<ThemeToggle className="size-8" toDark={copy.toDark} toLight={copy.toLight} />}
      onSignOut={() => {
        void onSignOut();
      }}
    >
      {children}
    </OpsShell>
  );
}
