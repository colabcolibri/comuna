export const EMAIL_KINDS = ['member_otp', 'ops_otp', 'person_invite', 'contact_notice'] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];
export type EmailLocale = 'pt-BR' | 'en';

export type MailEnvelope = {
  product_name: string;
  from_name: string;
  from_address: string;
  support_url: string;
  logo_url: string;
};

export type EmailSlot = 'otp' | 'cta' | 'quote';

export const KIND_SLOT: Record<EmailKind, EmailSlot> = {
  member_otp: 'otp',
  ops_otp: 'otp',
  person_invite: 'cta',
  contact_notice: 'quote',
};

export type EmailVariable = {
  name: string;
  sample: string;
  slot?: boolean;
};

export const KIND_VARIABLES: Record<EmailKind, EmailVariable[]> = {
  member_otp: [
    { name: 'code', sample: '123456', slot: true },
    { name: 'product_name', sample: 'Community' },
    { name: 'support_url', sample: 'https://example.com/help' },
  ],
  ops_otp: [
    { name: 'code', sample: '654321', slot: true },
    { name: 'product_name', sample: 'Community' },
    { name: 'support_url', sample: 'https://example.com/help' },
  ],
  person_invite: [
    { name: 'product_name', sample: 'Community' },
    { name: 'support_url', sample: 'https://example.com/help' },
    { name: 'login_url', sample: 'http://localhost:3014/login', slot: true },
  ],
  contact_notice: [
    { name: 'product_name', sample: 'Community' },
    { name: 'community_name', sample: 'Demo' },
    { name: 'sender_name', sample: 'Ada', slot: true },
    { name: 'sender_email', sample: 'ada@example.com', slot: true },
    { name: 'message', sample: 'Olá', slot: true },
  ],
};

export function previewVarsFor(
  kind: EmailKind,
  platform?: { product_name: string; support_url: string }
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const item of KIND_VARIABLES[kind]) {
    vars[item.name] = item.sample;
  }
  if (platform?.product_name) {
    vars.product_name = platform.product_name;
  }
  if (platform && 'support_url' in platform) {
    vars.support_url = platform.support_url;
  }
  return vars;
}

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
