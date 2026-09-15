'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { OpsShell } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { LocaleSwitcher } from './locale-switcher';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  brand: 'chrome.brand',
  communities: 'chrome.communities',
  signout: 'chrome.signout',
});

export function OpsChrome({ children }: { children: ReactNode }) {
  const copy = pickContent(CONTENT, useLocale());
  const router = useRouter();

  const onSignOut = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <OpsShell
      brand={copy.brand}
      communitiesLabel={copy.communities}
      signOutLabel={copy.signout}
      localeSlot={<LocaleSwitcher />}
      onSignOut={() => {
        void onSignOut();
      }}
    >
      {children}
    </OpsShell>
  );
}
