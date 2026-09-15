import { escapeHtml, interpolateMustache, interpolateMustacheHtml, type EmailKind, type EmailLocale } from './tokens';
import type { PlatformSettings } from '@community/platform';

export type MailBodies = {
  subject: string;
  html: string;
  text: string;
};

const DEFAULTS: Record<EmailKind, Record<EmailLocale, MailBodies>> = {
  member_otp: {
    'pt-BR': {
      subject: 'Seu código {{product_name}}',
      html: '<p style="margin:0 0 16px;font-size:16px;color:#1c1915;">Use este código para entrar:</p><p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:28px;letter-spacing:0.2em;color:#1c1915;">{{code}}</p>',
      text: 'Código {{product_name}}: {{code}}',
    },
    en: {
      subject: 'Your {{product_name}} code',
      html: '<p style="margin:0 0 16px;font-size:16px;color:#1c1915;">Use this code to sign in:</p><p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:28px;letter-spacing:0.2em;color:#1c1915;">{{code}}</p>',
      text: '{{product_name}} code: {{code}}',
    },
  },
  ops_otp: {
    'pt-BR': {
      subject: 'Código ops {{product_name}}',
      html: '<p style="margin:0 0 16px;font-size:16px;color:#1c1915;">Código para o admin:</p><p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:28px;letter-spacing:0.2em;color:#1c1915;">{{code}}</p>',
      text: 'Código ops {{product_name}}: {{code}}',
    },
    en: {
      subject: '{{product_name}} ops code',
      html: '<p style="margin:0 0 16px;font-size:16px;color:#1c1915;">Admin sign-in code:</p><p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:28px;letter-spacing:0.2em;color:#1c1915;">{{code}}</p>',
      text: '{{product_name}} ops code: {{code}}',
    },
  },
  person_invite: {
    'pt-BR': {
      subject: 'Você foi convidado a {{product_name}}',
      html: '<p style="margin:0 0 16px;font-size:16px;color:#1c1915;">Uma conta foi criada para você. Entre em {{login_url}} e peça um código no e-mail.</p>',
      text: 'Conta criada em {{product_name}}. Entre em {{login_url}} e peça um código.',
    },
    en: {
      subject: 'You were invited to {{product_name}}',
      html: '<p style="margin:0 0 16px;font-size:16px;color:#1c1915;">An account was created for you. Open {{login_url}} and request an email code.</p>',
      text: 'Account created on {{product_name}}. Open {{login_url}} and request a code.',
    },
  },
  contact_notice: {
    'pt-BR': {
      subject: 'Contato em {{community_name}}',
      html: '<p style="margin:0 0 12px;font-size:16px;color:#1c1915;">{{sender_name}} ({{sender_email}})</p><p style="margin:0;font-size:16px;color:#1c1915;">{{message}}</p>',
      text: '{{sender_name}} <{{sender_email}}>\n\n{{message}}',
    },
    en: {
      subject: 'Contact in {{community_name}}',
      html: '<p style="margin:0 0 12px;font-size:16px;color:#1c1915;">{{sender_name}} ({{sender_email}})</p><p style="margin:0;font-size:16px;color:#1c1915;">{{message}}</p>',
      text: '{{sender_name}} <{{sender_email}}>\n\n{{message}}',
    },
  },
};

export function defaultBodies(kind: EmailKind, locale: EmailLocale): MailBodies {
  return DEFAULTS[kind][locale];
}

export function wrapEnvelope(innerHtml: string, settings: PlatformSettings): string {
  const product = escapeHtml(settings.product_name || 'Community');
  const support = escapeHtml(settings.support_url || '');
  const logo = settings.logo_url
    ? `<img src="${escapeHtml(settings.logo_url)}" alt="${product}" width="120" style="display:block;margin:0 auto 24px;max-width:120px;height:auto;" />`
    : '';
  const footer = support
    ? `<p style="margin:24px 0 0;font-size:12px;color:#5c564e;text-align:center;"><a href="${support}" style="color:#c45c26;">${product}</a></p>`
    : `<p style="margin:24px 0 0;font-size:12px;color:#5c564e;text-align:center;">${product}</p>`;
  return `<!doctype html><html><body style="margin:0;background:#f3f0ea;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f0ea;padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fffcf7;border:1px solid #ddd6cc;border-radius:8px;padding:32px;">
      <tr><td>${logo}<div>${innerHtml}</div>${footer}</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export function composeMail(input: {
  kind: EmailKind;
  locale: EmailLocale;
  vars: Record<string, string>;
  settings: PlatformSettings;
  overlay?: MailBodies | null;
}): { subject: string; html: string; text: string } {
  const base = input.overlay ?? defaultBodies(input.kind, input.locale);
  const vars = { product_name: input.settings.product_name, support_url: input.settings.support_url, ...input.vars };
  if (vars.code && !/^\d+$/.test(vars.code)) {
    throw new Error('VALIDATION_ERROR');
  }
  return {
    subject: interpolateMustache(base.subject, vars),
    html: wrapEnvelope(interpolateMustacheHtml(base.html, vars), input.settings),
    text: interpolateMustache(base.text, vars),
  };
}

export const PREVIEW_VARS: Record<EmailKind, Record<string, string>> = {
  member_otp: { code: '123456' },
  ops_otp: { code: '654321' },
  person_invite: { login_url: 'http://localhost:3014/login' },
  contact_notice: {
    community_name: 'Demo',
    sender_name: 'Ada',
    sender_email: 'ada@example.com',
    message: 'Olá',
  },
};
