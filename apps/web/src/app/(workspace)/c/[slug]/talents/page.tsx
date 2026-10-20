'use client';

import { AppPageTemplate } from '@community/ui-member';
import { contentFromCatalog, pickContent } from '@community/identity';
import { TalentOffers } from '@/components/app/TalentOffers';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

export default function TalentsPage() {
  const copy = pickContent(contentFromCatalog(uiCatalog, 'core_identity', { title: 'talent.title' }), useLocale());
  return (
    <AppPageTemplate title={copy.title}>
      <TalentOffers heading={false} />
    </AppPageTemplate>
  );
}
