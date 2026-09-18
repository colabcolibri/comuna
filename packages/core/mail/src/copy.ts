import type { EmailKind, EmailLocale } from './tokens';

export type MailCopy = {
  subject: string;
  heading: string;
  body: string;
};

const DEFAULTS: Record<EmailKind, Record<EmailLocale, MailCopy>> = {
  member_otp: {
    'pt-BR': {
      subject: 'Código para entrar em {{product_name}}',
      heading: 'Seu código de acesso',
      body: 'Você pediu para entrar em {{product_name}}. Digite o código abaixo na tela de login. Ele vale por 10 minutos.\n\nSe você não pediu este código, ignore este e-mail. Ninguém entra na sua conta só com esta mensagem.',
    },
    en: {
      subject: 'Sign-in code for {{product_name}}',
      heading: 'Your sign-in code',
      body: 'You asked to sign in to {{product_name}}. Enter the code below on the login screen. It expires in 10 minutes.\n\nIf you did not ask for this code, ignore this email. Nobody can sign in with this message alone.',
    },
  },
  ops_otp: {
    'pt-BR': {
      subject: 'Código para o admin de {{product_name}}',
      heading: 'Entrar no admin',
      body: 'Você pediu para entrar no admin de {{product_name}}. Digite o código abaixo na tela de login. Ele vale por 10 minutos.\n\nSe você não pediu este código, ignore este e-mail.',
    },
    en: {
      subject: 'Admin sign-in code for {{product_name}}',
      heading: 'Sign in to admin',
      body: 'You asked to sign in to the {{product_name}} admin. Enter the code below on the login screen. It expires in 10 minutes.\n\nIf you did not ask for this code, ignore this email.',
    },
  },
  person_invite: {
    'pt-BR': {
      subject: 'Sua conta em {{product_name}} está pronta',
      heading: 'Você já pode entrar',
      body: 'Uma conta foi criada para você em {{product_name}}.\n\nAbra o login pelo botão abaixo. Na tela, use este mesmo e-mail e peça um código. O código chega numa mensagem seguinte.',
    },
    en: {
      subject: 'Your {{product_name}} account is ready',
      heading: 'You can sign in now',
      body: 'An account was created for you on {{product_name}}.\n\nOpen sign-in with the button below. On that page, use this same email and request a code. The code arrives in a separate message.',
    },
  },
  contact_notice: {
    'pt-BR': {
      subject: 'Mensagem para você em {{community_name}}',
      heading: 'Alguém escreveu pela {{community_name}}',
      body: 'Uma pessoa usou o formulário da comunidade para falar com você. Nome, e-mail e mensagem estão abaixo.\n\nResponda neste e-mail se quiser continuar a conversa. A resposta vai para quem escreveu, não para a plataforma.',
    },
    en: {
      subject: 'A message for you in {{community_name}}',
      heading: 'Someone wrote via {{community_name}}',
      body: 'Someone used the community form to reach you. Their name, email, and message are below.\n\nReply to this email if you want to continue the conversation. Your reply goes to them, not to the platform.',
    },
  },
};

export function defaultCopy(kind: EmailKind, locale: EmailLocale): MailCopy {
  return DEFAULTS[kind][locale];
}
