import { describe, expect, it } from 'vitest';
import { SPOKEN_LANGUAGES, spokenLanguageLabel } from './spoken-languages';

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
});
