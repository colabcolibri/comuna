'use client';

import { useLocale, useSetLocale } from '@/components/app/LocaleProvider';

export function LocaleSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  return (
    <div className="flex items-center rounded-lg border border-border p-0.5" role="group" aria-label="Idioma">
      <button
        type="button"
        className={`min-h-11 px-3 text-sm rounded-md ${locale === 'pt-BR' ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground'}`}
        onClick={() => setLocale('pt-BR')}
      >
        PT
      </button>
      <button
        type="button"
        className={`min-h-11 px-3 text-sm rounded-md ${locale === 'en' ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground'}`}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  );
}
