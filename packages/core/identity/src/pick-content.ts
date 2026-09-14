export type Locale = 'pt-BR' | 'en';

export const LOCALE_COOKIE = 'ui_locale';

export function resolveUiLocale(raw: string | undefined): Locale {
  if (raw === 'en') {
    return 'en';
  }
  return 'pt-BR';
}

export function pickContent<T extends Record<Locale, unknown>>(
  content: T,
  locale: string | undefined
): T[Locale] {
  return content[resolveUiLocale(locale)];
}
