'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { LOCALE_COOKIE, resolveUiLocale, type Locale } from '@community/identity';

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (next: Locale) => void;
}>({
  locale: 'pt-BR',
  setLocale: () => undefined,
});

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: string | undefined;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => resolveUiLocale(initialLocale));

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
        setLocaleState(next);
      },
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

export function useSetLocale() {
  return useContext(LocaleContext).setLocale;
}
