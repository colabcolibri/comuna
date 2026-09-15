export const EMAIL_KINDS = ['member_otp', 'ops_otp', 'person_invite', 'contact_notice'] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];
export type EmailLocale = 'pt-BR' | 'en';

export function isEmailKind(value: string): value is EmailKind {
  return (EMAIL_KINDS as readonly string[]).includes(value);
}

export function isEmailLocale(value: string): value is EmailLocale {
  return value === 'pt-BR' || value === 'en';
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function interpolateMustache(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

export function interpolateMustacheHtml(template: string, vars: Record<string, string>): string {
  const escaped: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    escaped[key] = escapeHtml(value);
  }
  return interpolateMustache(template, escaped);
}
