export type Locale = 'pt-BR' | 'en';

export function pickContent<T extends Record<Locale, unknown>>(
  content: T,
  locale: string | undefined
): T[Locale] {
  if (locale === 'en') {
    return content.en;
  }
  return content['pt-BR'];
}
