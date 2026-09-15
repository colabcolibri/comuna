import { describe, expect, it } from 'vitest';
import { localizedPair, parseLocalized, pickLocalizedEntries, pickLocalizedText, valueAt } from './localized-text';

describe('member localized copy', () => {
  it('picks member copy for the ui locale and falls back to the other language', () => {
    expect(pickLocalizedText({ 'pt-BR': 'Engenheira', en: 'Engineer' }, 'en')).toBe('Engineer');
    expect(pickLocalizedText({ 'pt-BR': 'Engenheira', en: '' }, 'en')).toBe('Engenheira');
  });

  it('stores and reads locale/value arrays', () => {
    const copy = localizedPair('Engenheira', 'Engineer');
    expect(parseLocalized(copy)).toEqual([
      { locale: 'pt-BR', value: 'Engenheira' },
      { locale: 'en', value: 'Engineer' },
    ]);
    expect(valueAt(copy, 'en')).toBe('Engineer');
    expect(pickLocalizedEntries(copy, 'en')).toBe('Engineer');
    expect(pickLocalizedText(copy, 'fr')).toBe('Engenheira');
  });
});
