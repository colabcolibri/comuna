'use client';

import { useLocale, useSetLocale } from '@/components/app/LocaleProvider';

export function LocaleSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Idioma">
      <button
        type="button"
        className={`min-h-11 px-2 text-sm rounded-lg ${locale === 'pt-BR' ? 'font-semibold border border-border' : 'text-muted-foreground'}`}
        onClick={() => setLocale('pt-BR')}
      >
        pt-BR
      </button>
      <button
        type="button"
        className={`min-h-11 px-2 text-sm rounded-lg ${locale === 'en' ? 'font-semibold border border-border' : 'text-muted-foreground'}`}
        onClick={() => setLocale('en')}
      >
        en
      </button>
    </div>
  );
}
