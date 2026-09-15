'use client';

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
    <div className="inline-flex items-center rounded-md bg-muted p-1" role="group" aria-label={copy.group}>
      <button
        type="button"
        className={`h-7 rounded-sm px-2.5 text-sm ${locale === 'pt-BR' ? 'bg-background font-medium text-foreground shadow-sm' : 'text-muted-foreground'}`}
        onClick={() => setLocale('pt-BR')}
      >
        {copy.pt}
      </button>
      <button
        type="button"
        className={`h-7 rounded-sm px-2.5 text-sm ${locale === 'en' ? 'bg-background font-medium text-foreground shadow-sm' : 'text-muted-foreground'}`}
        onClick={() => setLocale('en')}
      >
        {copy.en}
      </button>
    </div>
  );
}
