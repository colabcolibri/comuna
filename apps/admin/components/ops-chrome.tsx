'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@community/ui';
import { OpsShell } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { LocaleSwitcher } from './locale-switcher';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  brand: 'chrome.brand',
  communities: 'chrome.communities',
  signout: 'chrome.signout',
  menu: 'chrome.open_menu',
  toDark: 'theme.to_dark',
  toLight: 'theme.to_light',
});

export function OpsChrome({ children }: { children: ReactNode }) {
  const copy = pickContent(CONTENT, useLocale());
  const router = useRouter();
  const pathname = usePathname();

  const onSignOut = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <OpsShell
      brand={copy.brand}
      communitiesLabel={copy.communities}
      communitiesActive={pathname.startsWith('/communities')}
      signOutLabel={copy.signout}
      menuLabel={copy.menu}
      localeSlot={<LocaleSwitcher />}
      themeSlot={<ThemeToggle className="size-9" toDark={copy.toDark} toLight={copy.toLight} />}
      onSignOut={() => {
        void onSignOut();
      }}
    >
      {children}
    </OpsShell>
  );
}
