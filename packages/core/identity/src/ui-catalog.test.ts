import { describe, expect, it } from 'vitest';
import { createUiCatalog, definePack, interpolate } from './ui-catalog';

const pack = definePack({
  'pt-BR': { hello: 'Olá {name}', onlyPt: 'Só pt' },
  en: { hello: 'Hello {name}', onlyPt: 'Só pt' },
});

describe('ui catalog', () => {
  it('resolves pack then overlay', () => {
    const catalog = createUiCatalog(
      { core_web: pack },
      {
        read: ({ id }) => (id === 'hello' ? 'Overlay {name}' : undefined),
      }
    );
    expect(catalog.t('core_web', 'hello', 'en', { name: 'Ada' })).toBe('Overlay Ada');
  });

  it('falls back to pt-BR then to the key', () => {
    const catalog = createUiCatalog({ core_web: pack });
    expect(catalog.t('core_web', 'hello', 'fr', { name: 'Ada' })).toBe('Olá Ada');
    expect(catalog.t('missing', 'nope', 'en')).toBe('nope');
  });

  it('interpolates placeholders', () => {
    expect(interpolate('Hi {name}', { name: 'Ada' })).toBe('Hi Ada');
  });
});
