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
    <div className="flex items-center rounded-md border border-border p-0.5" role="group" aria-label={copy.group}>
      <button
        type="button"
        className={`min-h-11 px-3 text-sm rounded-md ${locale === 'pt-BR' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}
        onClick={() => setLocale('pt-BR')}
      >
        {copy.pt}
      </button>
      <button
        type="button"
        className={`min-h-11 px-3 text-sm rounded-md ${locale === 'en' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}
        onClick={() => setLocale('en')}
      >
        {copy.en}
      </button>
    </div>
  );
}
