import { pickContent, resolveUiLocale } from './pick-content';

describe('pickContent', () => {
  const CONTENT = {
    'pt-BR': { title: 'Entrar' },
    en: { title: 'Sign in' },
  } as const;

  it('falls back to pt-BR', () => {
    expect(pickContent(CONTENT, undefined).title).toBe('Entrar');
  });

  it('selects en', () => {
    expect(pickContent(CONTENT, 'en').title).toBe('Sign in');
  });

  it('treats unknown cookie values as pt-BR', () => {
    expect(resolveUiLocale('fr')).toBe('pt-BR');
    expect(pickContent(CONTENT, 'fr').title).toBe('Entrar');
  });
});
