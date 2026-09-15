import { query } from '@community/db';
import { composeMail, defaultCopy, type MailCopy } from './compose';
import { isEmailKind, isEmailLocale, KIND_SLOT, KIND_VARIABLES, previewVarsFor, type EmailKind, type EmailLocale, type EmailSlot, type EmailVariable } from './tokens';
import { sendSmtpMail, formatReplyToHeader, isSmtpConfigured } from '@community/auth/smtp';
import { formatFromHeader, getPlatformSettings, type PlatformSettings } from '@community/platform';

export class MailValidationError extends Error {
  constructor() {
    super('VALIDATION_ERROR');
    this.name = 'MailValidationError';
  }
}

type OverlayRow = {
  subject: string;
  heading: string;
  body: string;
};

export async function getEmailOverlay(kind: EmailKind, locale: EmailLocale): Promise<MailCopy | null> {
  const result = await query<OverlayRow>(
    `SELECT subject, heading, body
     FROM ops_core.email_templates
     WHERE kind = $1 AND locale = $2`,
    [kind, locale]
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  if (!row.heading.trim() && !row.body.trim()) {
    return null;
  }
  return { subject: row.subject, heading: row.heading, body: row.body };
}

export async function upsertEmailOverlay(kind: EmailKind, locale: EmailLocale, copy: MailCopy): Promise<void> {
  const subject = copy.subject.trim();
  const heading = copy.heading.trim();
  const body = copy.body.trim();
  if (!subject || !heading || !body) {
    throw new MailValidationError();
  }
  const overlay = { subject, heading, body };
  const settings = await getPlatformSettings();
  const vars = previewVarsFor(kind, settings);
  if (kind === 'person_invite') {
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3014';
    vars.login_url = `${origin.replace(/\/$/, '')}/login`;
  }
  const rendered = composeMail({ kind, locale, vars, settings, overlay });
  await query(
    `INSERT INTO ops_core.email_templates (kind, locale, subject, heading, body, html_body, text_body)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (kind, locale)
     DO UPDATE SET subject = excluded.subject, heading = excluded.heading, body = excluded.body,
       html_body = excluded.html_body, text_body = excluded.text_body, updated_at = now()`,
    [kind, locale, overlay.subject, overlay.heading, overlay.body, rendered.html, rendered.text]
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
  heading: string;
  body: string;
  overlay: boolean;
  previewHtml: string;
  slot: EmailSlot;
  variables: EmailVariable[];
  envelope: PlatformSettings;
};

export async function listEmailTemplates(kind: string, locale: string): Promise<TemplateView> {
  if (!isEmailKind(kind) || !isEmailLocale(locale)) {
    throw new MailValidationError();
  }
  const settings = await getPlatformSettings();
  const overlay = await getEmailOverlay(kind, locale);
  const copy = overlay ?? defaultCopy(kind, locale);
  const vars = previewVarsFor(kind, settings);
  if (kind === 'person_invite') {
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3014';
    vars.login_url = `${origin.replace(/\/$/, '')}/login`;
  }
  const preview = composeMail({
    kind,
    locale,
    vars,
    settings,
    overlay,
  });
  return {
    kind,
    locale,
    subject: copy.subject,
    heading: copy.heading,
    body: copy.body,
    overlay: Boolean(overlay),
    previewHtml: preview.html,
    slot: KIND_SLOT[kind],
    variables: KIND_VARIABLES[kind],
    envelope: settings,
  };
}

export async function sendKindEmail(input: {
  kind: EmailKind;
  to: string;
  locale: EmailLocale;
  vars: Record<string, string>;
}): Promise<void> {
  if (!isSmtpConfigured()) {
    return;
  }
  const settings = await getPlatformSettings();
  const rendered = await renderEmail({ kind: input.kind, locale: input.locale, vars: input.vars, settings });
  await sendSmtpMail({
    from: formatFromHeader(settings, process.env.EMAIL_FROM_ADDRESS),
    to: input.to,
    replyTo:
      input.kind === 'contact_notice'
        ? formatReplyToHeader(input.vars.sender_name, input.vars.sender_email)
        : undefined,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}
