import { describe, expect, it } from 'vitest';
import { SPOKEN_LANGUAGES, spokenLanguageLabel, spokenLanguageOptions, sortSpokenLanguages } from './spoken-languages';

describe('spoken languages', () => {
  it('lists twelve central language codes', () => {
    expect(SPOKEN_LANGUAGES.map((item) => item.value)).toEqual([
      'pt',
      'en',
      'es',
      'fr',
      'de',
      'it',
      'nl',
      'zh',
      'ja',
      'ko',
      'ru',
      'ar',
    ]);
  });

  it('labels a code for the ui locale', () => {
    expect(spokenLanguageLabel('nl', 'pt-BR')).toBe('Holandês');
    expect(spokenLanguageLabel('zh', 'en')).toBe('Chinese');
    expect(spokenLanguageLabel('xx', 'pt-BR')).toBeNull();
  });

  it('sorts options and profile languages alphabetically for the ui locale', () => {
    const options = spokenLanguageOptions('pt-BR');
    for (let index = 1; index < options.length; index += 1) {
      expect(
        options[index - 1].label.localeCompare(options[index].label, 'pt-BR', { sensitivity: 'base' })
      ).toBeLessThanOrEqual(0);
    }
    expect(
      sortSpokenLanguages(
        [
          { code: 'en', proficiency: 'fluent' },
          { code: 'pt', proficiency: 'native' },
          { code: 'es', proficiency: 'basic' },
        ],
        'pt-BR'
      ).map((item) => item.code)
    ).toEqual(['es', 'en', 'pt']);
  });
});
