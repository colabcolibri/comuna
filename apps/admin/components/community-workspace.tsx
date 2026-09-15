'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { OpsPageTemplate } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  back: 'community.back',
  backTo: 'community.back_to',
});

export function CommunityWorkspace({
  name,
  slug,
  children,
}: {
  name: string;
  slug: string;
  children: ReactNode;
}) {
  const copy = pickContent(CONTENT, useLocale());

  return (
    <OpsPageTemplate
      backHref="/communities"
      backLabel={copy.back}
      backAriaLabel={copy.backTo}
      title={name}
      subtitle={slug}
      subtitleClassName="font-mono text-sm"
      linkComponent={Link}
    >
      {children}
    </OpsPageTemplate>
  );
}
