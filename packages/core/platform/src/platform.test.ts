import { describe, expect, it } from 'vitest';
import { PlatformValidationError, parsePlatformInput, resolveFromAddress } from './platform';

describe('parsePlatformInput', () => {
  it('accepts a valid from address and https logo', () => {
    expect(
      parsePlatformInput({
        product_name: 'Rede',
        from_name: 'Ops',
        from_address: 'Auth@Example.com',
        support_url: 'https://example.com/help',
        logo_url: 'https://example.com/logo.png',
      })
    ).toMatchObject({ from_address: 'auth@example.com', product_name: 'Rede' });
  });

  it('rejects a from without @', () => {
    expect(() =>
      parsePlatformInput({
        product_name: 'Rede',
        from_name: 'Ops',
        from_address: 'nao-e-email',
        support_url: '',
        logo_url: '',
      })
    ).toThrow(PlatformValidationError);
  });

  it('rejects javascript logo urls', () => {
    expect(() =>
      parsePlatformInput({
        product_name: 'Rede',
        from_name: 'Ops',
        from_address: 'a@b.c',
        support_url: '',
        logo_url: 'javascript:alert(1)',
      })
    ).toThrow(PlatformValidationError);
  });
});

describe('resolveFromAddress', () => {
  it('prefers the stored address then env', () => {
    expect(
      resolveFromAddress(
        { product_name: 'A', from_name: 'A', from_address: 'ops@x.com', support_url: '', logo_url: '' },
        'env@x.com'
      )
    ).toBe('ops@x.com');
    expect(
      resolveFromAddress(
        { product_name: 'A', from_name: 'A', from_address: '', support_url: '', logo_url: '' },
        'env@x.com'
      )
    ).toBe('env@x.com');
  });
});
