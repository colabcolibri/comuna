import type { LocalizedText } from './localized-text';

const loc = (pt: string, en: string): LocalizedText => [
  { locale: 'pt-BR', value: pt },
  { locale: 'en', value: en },
];

export const SPOKEN_LANGUAGES = [
  { value: 'pt', label: loc('Português', 'Portuguese') },
  { value: 'en', label: loc('Inglês', 'English') },
  { value: 'es', label: loc('Espanhol', 'Spanish') },
  { value: 'fr', label: loc('Francês', 'French') },
  { value: 'de', label: loc('Alemão', 'German') },
  { value: 'it', label: loc('Italiano', 'Italian') },
  { value: 'nl', label: loc('Holandês', 'Dutch') },
  { value: 'zh', label: loc('Chinês', 'Chinese') },
  { value: 'ja', label: loc('Japonês', 'Japanese') },
  { value: 'ko', label: loc('Coreano', 'Korean') },
  { value: 'ru', label: loc('Russo', 'Russian') },
  { value: 'ar', label: loc('Árabe', 'Arabic') },
] as const;

export type SpokenLanguageCode = (typeof SPOKEN_LANGUAGES)[number]['value'];

export function spokenLanguageLabel(code: string, locale: string) {
  const row = SPOKEN_LANGUAGES.find((item) => item.value === code);
  if (!row) {
    return null;
  }
  const hit = row.label.find((entry) => entry.locale === locale) || row.label[0];
  return hit?.value || null;
}

export function compareSpokenLanguageCodes(a: string, b: string, locale: string) {
  const left = spokenLanguageLabel(a, locale) || a;
  const right = spokenLanguageLabel(b, locale) || b;
  return left.localeCompare(right, locale, { sensitivity: 'base' });
}

export function spokenLanguageOptions(locale: string) {
  return SPOKEN_LANGUAGES.map((item) => ({
    value: item.value,
    label: spokenLanguageLabel(item.value, locale) || item.value,
  })).sort((a, b) => a.label.localeCompare(b.label, locale, { sensitivity: 'base' }));
}

export function sortSpokenLanguages<T extends { code: string }>(items: T[], locale: string): T[] {
  return [...items].sort((a, b) => compareSpokenLanguageCodes(a.code, b.code, locale));
}
