'use client';

import { pickContent } from '@community/identity';
import { useLocale, useSetLocale } from '@/components/app/LocaleProvider';

const CONTENT = {
  'pt-BR': {
    group: 'Idioma',
    pt: 'PT',
    en: 'EN',
  },
  en: {
    group: 'Language',
    pt: 'PT',
    en: 'EN',
  },
} as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const copy = pickContent(CONTENT, locale);
  return (
    <div className="flex items-center rounded-lg border border-border p-0.5" role="group" aria-label={copy.group}>
      <button
        type="button"
        className={`min-h-11 px-3 text-sm rounded-md ${locale === 'pt-BR' ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground'}`}
        onClick={() => setLocale('pt-BR')}
      >
        {copy.pt}
      </button>
      <button
        type="button"
        className={`min-h-11 px-3 text-sm rounded-md ${locale === 'en' ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground'}`}
        onClick={() => setLocale('en')}
      >
        {copy.en}
      </button>
    </div>
  );
}
