import { describe, expect, it } from 'vitest';
import { composeMail, KIND_VARIABLES, previewVarsFor } from './compose';
import { escapeHtml, interpolateMustacheHtml } from './tokens';

const settings = {
  product_name: 'Rede',
  from_name: 'Ops',
  from_address: 'ops@example.com',
  support_url: 'https://example.com/help',
  logo_url: '',
};

describe('composeMail', () => {
  it('fills the shared template with the otp slot', () => {
    const mail = composeMail({
      kind: 'member_otp',
      locale: 'pt-BR',
      vars: { code: '123456' },
      settings,
    });
    expect(mail.subject).toContain('Rede');
    expect(mail.html).toContain('max-width:600px');
    expect(mail.html).toContain('123456');
    expect(mail.html).toContain('Entrar em Rede');
    expect(mail.html).toContain('IBM Plex Sans');
    expect(mail.html).toContain('text-align:center');
    expect(mail.html).toContain('#f3f0ea');
    expect(mail.html).toContain('#c45c26');
    expect(mail.text).toContain('123456');
  });

  it('rejects a non-digit code', () => {
    expect(() =>
      composeMail({ kind: 'member_otp', locale: 'pt-BR', vars: { code: '12<a>' }, settings })
    ).toThrow('VALIDATION_ERROR');
  });

  it('keeps a closed variable catalog per kind', () => {
    expect(KIND_VARIABLES.member_otp.map((item) => item.name)).toEqual(['code', 'product_name', 'support_url']);
    expect(previewVarsFor('contact_notice', settings).community_name).toBe('Demo');
  });

  it('re-composes overlay copy into the same template', () => {
    const mail = composeMail({
      kind: 'member_otp',
      locale: 'pt-BR',
      vars: previewVarsFor('member_otp', settings),
      settings,
      overlay: {
        subject: 'x',
        heading: 'Olá',
        body: 'O código vai abaixo.',
      },
    });
    expect(mail.html).toContain('Olá');
    expect(mail.html).toContain('O código vai abaixo.');
    expect(mail.html).toContain('123456');
  });

  it('puts invite login into a cta, not into free html', () => {
    const mail = composeMail({
      kind: 'person_invite',
      locale: 'pt-BR',
      vars: previewVarsFor('person_invite', settings),
      settings,
    });
    expect(mail.html).toContain('href="http://localhost:3014/login"');
    expect(mail.html).toContain('Entrar');
    expect(mail.html).toContain('#1f3d38');
  });

  it('puts community name in the contact subject and phone in the quote', () => {
    const mail = composeMail({
      kind: 'contact_notice',
      locale: 'pt-BR',
      vars: { ...previewVarsFor('contact_notice', settings), sender_phone: '+55 11 99999-0000' },
      settings,
    });
    expect(mail.subject).toBe('Contato em Demo');
    expect(mail.html).toContain('Novo recado em Demo');
    expect(mail.html).toContain('+55 11 99999-0000');
    expect(mail.text).toContain('+55 11 99999-0000');
  });

  it('escapes html in contact message', () => {
    expect(interpolateMustacheHtml('<p>{{message}}</p>', { message: '<script>' })).toBe(
      '<p>&lt;script&gt;</p>'
    );
    expect(escapeHtml('"')).toBe('&quot;');
    const mail = composeMail({
      kind: 'contact_notice',
      locale: 'pt-BR',
      vars: { ...previewVarsFor('contact_notice', settings), message: '<script>' },
      settings,
    });
    expect(mail.html).toContain('&lt;script&gt;');
    expect(mail.html).not.toContain('<script>');
  });
});
