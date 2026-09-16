import { describe, expect, it } from 'vitest';
import { parseListField } from './list-fields';
import { languageFilterQueryValue, languagesIsFilterable, parseLanguageFilter } from './language-filter';

const languages = parseListField({
  name: 'languages',
  type: 'checkbox',
  storage: 'person',
  column_key: 'languages',
  filterable: true,
  placement: 'card',
})!;

describe('language filter', () => {
  it('detects when languages are filterable on the list', () => {
    expect(languagesIsFilterable([languages])).toBe(true);
    expect(languagesIsFilterable([{ ...languages, filterable: false }])).toBe(false);
  });

  it('keeps only known language codes', () => {
    expect(parseLanguageFilter('pt,en,xx,pt')).toEqual(['pt', 'en']);
    expect(languageFilterQueryValue(['pt', 'en'])).toBe('pt,en');
  });
});
