import { SPOKEN_LANGUAGES } from '@community/identity';
import type { ListField } from './list-fields';

const VALID = new Set<string>(SPOKEN_LANGUAGES.map((item) => item.value));

export function languagesIsFilterable(fields: ListField[]): boolean {
  return fields.some(
    (field) => (field.column_key === 'languages' || field.name === 'languages') && field.filterable
  );
}

export function parseLanguageFilter(raw: string | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of String(raw || '').split(',')) {
    const code = part.trim();
    if (VALID.has(code) && !seen.has(code)) {
      seen.add(code);
      out.push(code);
    }
  }
  return out;
}

export function languageFilterQueryValue(codes: string[]): string {
  return codes.join(',');
}
