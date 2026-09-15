import { defaultCopy, type MailCopy } from './copy';
import { renderMailHtml, renderMailText } from './layout';
import { interpolateMustache, type EmailKind, type EmailLocale, type MailEnvelope } from './tokens';

export type { MailCopy } from './copy';
export type { MailEnvelope } from './tokens';

export function composeMail(input: {
  kind: EmailKind;
  locale: EmailLocale;
  vars: Record<string, string>;
  settings: MailEnvelope;
  overlay?: MailCopy | null;
}): { subject: string; html: string; text: string } {
  const copy = input.overlay ?? defaultCopy(input.kind, input.locale);
  const vars = { product_name: input.settings.product_name, support_url: input.settings.support_url, ...input.vars };
  if (vars.code && !/^\d+$/.test(vars.code)) {
    throw new Error('VALIDATION_ERROR');
  }
  const heading = interpolateMustache(copy.heading, vars);
  const body = interpolateMustache(copy.body, vars);
  return {
    subject: interpolateMustache(copy.subject, vars),
    html: renderMailHtml({ kind: input.kind, locale: input.locale, heading, body, vars, settings: input.settings }),
    text: renderMailText({ kind: input.kind, locale: input.locale, heading, body, vars, settings: input.settings }),
  };
}

export { defaultCopy } from './copy';
export { KIND_SLOT, KIND_VARIABLES, previewVarsFor, type EmailSlot, type EmailVariable } from './tokens';
