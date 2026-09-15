import { query } from '@community/db';
import { composeMail, defaultBodies, type MailBodies } from './compose';
import { isEmailKind, isEmailLocale, type EmailKind, type EmailLocale } from './tokens';
import { getPlatformSettings, type PlatformSettings } from '@community/platform';
import { sendSmtpMail } from '@community/auth';
import { formatFromHeader } from '@community/platform';

export class MailValidationError extends Error {
  constructor() {
    super('VALIDATION_ERROR');
    this.name = 'MailValidationError';
  }
}

export async function getEmailOverlay(kind: EmailKind, locale: EmailLocale): Promise<MailBodies | null> {
  const result = await query<MailBodies>(
    `SELECT subject, html_body AS html, text_body AS text
     FROM ops_core.email_templates
     WHERE kind = $1 AND locale = $2`,
    [kind, locale]
  );
  const row = result.rows[0];
  return row ? { subject: row.subject, html: row.html, text: row.text } : null;
}

export async function upsertEmailOverlay(
  kind: EmailKind,
  locale: EmailLocale,
  body: { subject: string; html_body: string; text_body: string }
): Promise<void> {
  const subject = body.subject.trim();
  const html_body = body.html_body.trim();
  const text_body = body.text_body.trim();
  if (!subject || !html_body || !text_body) {
    throw new MailValidationError();
  }
  await query(
    `INSERT INTO ops_core.email_templates (kind, locale, subject, html_body, text_body)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (kind, locale)
     DO UPDATE SET subject = excluded.subject, html_body = excluded.html_body, text_body = excluded.text_body, updated_at = now()`,
    [kind, locale, subject, html_body, text_body]
  );
}

export async function deleteEmailOverlay(kind: EmailKind, locale: EmailLocale): Promise<void> {
  await query(`DELETE FROM ops_core.email_templates WHERE kind = $1 AND locale = $2`, [kind, locale]);
}

export async function renderEmail(input: {
  kind: EmailKind;
  locale: EmailLocale;
  vars: Record<string, string>;
  settings?: PlatformSettings;
}): Promise<{ subject: string; html: string; text: string }> {
  const settings = input.settings ?? (await getPlatformSettings());
  const overlay = await getEmailOverlay(input.kind, input.locale);
  return composeMail({ kind: input.kind, locale: input.locale, vars: input.vars, settings, overlay });
}

export type TemplateView = {
  kind: EmailKind;
  locale: EmailLocale;
  subject: string;
  html_body: string;
  text_body: string;
  overlay: boolean;
  previewHtml: string;
};

export async function listEmailTemplates(kind: string, locale: string): Promise<TemplateView> {
  if (!isEmailKind(kind) || !isEmailLocale(locale)) {
    throw new MailValidationError();
  }
  const settings = await getPlatformSettings();
  const overlay = await getEmailOverlay(kind, locale);
  const base = overlay ?? defaultBodies(kind, locale);
  const preview = composeMail({
    kind,
    locale,
    vars: {
      code: '123456',
      login_url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : 'http://localhost:3014/login',
      community_name: 'Demo',
      sender_name: 'Ada',
      sender_email: 'ada@example.com',
      message: 'Olá',
    },
    settings,
    overlay,
  });
  return {
    kind,
    locale,
    subject: base.subject,
    html_body: base.html,
    text_body: base.text,
    overlay: Boolean(overlay),
    previewHtml: preview.html,
  };
}

export async function sendKindEmail(input: {
  kind: EmailKind;
  to: string;
  locale: EmailLocale;
  vars: Record<string, string>;
}): Promise<void> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return;
  }
  const settings = await getPlatformSettings();
  const rendered = await renderEmail({ kind: input.kind, locale: input.locale, vars: input.vars, settings });
  await sendSmtpMail({
    host,
    port: Number(process.env.SMTP_PORT || '1026'),
    from: formatFromHeader(settings, process.env.EMAIL_FROM_ADDRESS),
    to: input.to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}
