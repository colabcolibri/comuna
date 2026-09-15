import { resolveUiLocale, type Locale } from './locales';

export type LocalizedEntry = {
  locale: Locale;
  value: string;
};

export type LocalizedText = LocalizedEntry[];

const LOCALES: Locale[] = ['pt-BR', 'en'];

export function parseLocalized(raw: unknown): LocalizedText {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set<Locale>();
  const out: LocalizedText = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const locale = (item as LocalizedEntry).locale;
    const value = String((item as LocalizedEntry).value || '').trim();
    if (!LOCALES.includes(locale) || seen.has(locale) || !value) {
      continue;
    }
    seen.add(locale);
    out.push({ locale, value });
  }
  return out;
}

export function localizedPair(pt: string, en: string): LocalizedText {
  return parseLocalized([
    { locale: 'pt-BR', value: pt },
    { locale: 'en', value: en },
  ]);
}

export function valueAt(entries: unknown, locale: Locale): string {
  const parsed = parseLocalized(entries);
  return parsed.find((entry) => entry.locale === locale)?.value || '';
}

export function pickLocalizedEntries(entries: unknown, locale: string | undefined): string {
  const parsed = parseLocalized(entries);
  const resolved = resolveUiLocale(locale);
  const preferred = parsed.find((entry) => entry.locale === resolved);
  if (preferred?.value) {
    return preferred.value;
  }
  return parsed.find((entry) => entry.locale === 'pt-BR')?.value || parsed.find((entry) => entry.locale === 'en')?.value || '';
}

export function pickLocalizedText(
  values: LocalizedText | { 'pt-BR'?: string | null; en?: string | null },
  locale: string | undefined
): string {
  if (Array.isArray(values)) {
    return pickLocalizedEntries(values, locale);
  }
  return pickLocalizedEntries(
    [
      { locale: 'pt-BR', value: values['pt-BR'] || '' },
      { locale: 'en', value: values.en || '' },
    ],
    locale
  );
}
