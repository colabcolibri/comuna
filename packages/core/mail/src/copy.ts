import type { EmailKind, EmailLocale } from './tokens';

export type MailCopy = {
  subject: string;
  heading: string;
  body: string;
};

const DEFAULTS: Record<EmailKind, Record<EmailLocale, MailCopy>> = {
  member_otp: {
    'pt-BR': {
      subject: 'Seu código {{product_name}}',
      heading: 'Entrar em {{product_name}}',
      body: 'Use o código abaixo para entrar na sua conta.\n\nEle vale por poucos minutos. Se você não pediu este e-mail, ignore.',
    },
    en: {
      subject: 'Your {{product_name}} code',
      heading: 'Sign in to {{product_name}}',
      body: 'Use the code below to sign in to your account.\n\nIt expires in a few minutes. If you did not request this email, ignore it.',
    },
  },
  ops_otp: {
    'pt-BR': {
      subject: 'Código ops {{product_name}}',
      heading: 'Acesso ops',
      body: 'Use o código abaixo para entrar no admin.\n\nSe você não pediu este e-mail, ignore.',
    },
    en: {
      subject: '{{product_name}} ops code',
      heading: 'Ops sign-in',
      body: 'Use the code below to sign in to admin.\n\nIf you did not request this email, ignore it.',
    },
  },
  person_invite: {
    'pt-BR': {
      subject: 'Você foi convidado a {{product_name}}',
      heading: 'Uma conta foi criada para você',
      body: 'Você já pode entrar na plataforma.\n\nPeça um código no e-mail para começar. O botão abaixo abre o login.',
    },
    en: {
      subject: 'You were invited to {{product_name}}',
      heading: 'An account was created for you',
      body: 'You can sign in to the platform.\n\nRequest an email code to get started. The button below opens login.',
    },
  },
  contact_notice: {
    'pt-BR': {
      subject: 'Contato em {{community_name}}',
      heading: 'Novo recado em {{community_name}}',
      body: 'Alguém enviou uma mensagem pela comunidade.\n\nO recado segue abaixo.',
    },
    en: {
      subject: 'Contact in {{community_name}}',
      heading: 'New message in {{community_name}}',
      body: 'Someone sent a message through the community.\n\nThe note is below.',
    },
  },
};

export function defaultCopy(kind: EmailKind, locale: EmailLocale): MailCopy {
  return DEFAULTS[kind][locale];
}
