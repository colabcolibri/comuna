import { describe, expect, it } from 'vitest';
import { composeMail } from './compose';
import { escapeHtml, interpolateMustacheHtml } from './tokens';

const settings = {
  product_name: 'Rede',
  from_name: 'Ops',
  from_address: 'ops@example.com',
  support_url: 'https://example.com/help',
  logo_url: '',
};

describe('composeMail', () => {
  it('wraps otp html in a 600px envelope and interpolates the code', () => {
    const mail = composeMail({
      kind: 'member_otp',
      locale: 'pt-BR',
      vars: { code: '123456' },
      settings,
    });
    expect(mail.subject).toContain('Rede');
    expect(mail.html).toContain('max-width:600px');
    expect(mail.html).toContain('123456');
    expect(mail.text).toContain('123456');
    expect(mail.html).toContain('#f3f0ea');
  });

  it('rejects a non-digit code', () => {
    expect(() =>
      composeMail({ kind: 'member_otp', locale: 'pt-BR', vars: { code: '12<a>' }, settings })
    ).toThrow('VALIDATION_ERROR');
  });

  it('escapes html in contact message', () => {
    expect(interpolateMustacheHtml('<p>{{message}}</p>', { message: '<script>' })).toBe(
      '<p>&lt;script&gt;</p>'
    );
    expect(escapeHtml('"')).toBe('&quot;');
  });
});
