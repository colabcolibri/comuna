'use client';

import { Button } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale, useSetLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  group: 'locale.group',
  pt: 'locale.pt',
  en: 'locale.en',
});

export function LocaleSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const copy = pickContent(CONTENT, locale);
  return (
    <div className="inline-flex h-9 items-center rounded-md border border-border p-0.5" role="group" aria-label={copy.group}>
      <Button
        type="button"
        variant={locale === 'pt-BR' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 px-2.5"
        onClick={() => setLocale('pt-BR')}
      >
        {copy.pt}
      </Button>
      <Button
        type="button"
        variant={locale === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 px-2.5"
        onClick={() => setLocale('en')}
      >
        {copy.en}
      </Button>
    </div>
  );
}
