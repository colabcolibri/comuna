import { escapeHtml, KIND_SLOT, type EmailKind, type EmailLocale, type MailEnvelope } from './tokens';

const FONT =
  "'IBM Plex Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace";

const CTA_LABEL: Record<EmailLocale, string> = {
  'pt-BR': 'Entrar',
  en: 'Sign in',
};

const OTP_LABEL: Record<EmailLocale, string> = {
  'pt-BR': 'Código',
  en: 'Code',
};

function paragraphsHtml(body: string): string {
  const blocks = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks.length === 0) {
    return '';
  }
  return blocks
    .map((block) => {
      const html = escapeHtml(block).replace(/\n/g, '<br />');
      return `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:#1c1915;text-align:center;">${html}</p>`;
    })
    .join('');
}

function brandBlock(settings: MailEnvelope): string {
  const product = escapeHtml(settings.product_name || 'Community');
  if (settings.logo_url) {
    return `<img src="${escapeHtml(settings.logo_url)}" alt="${product}" width="140" style="display:block;margin:0 auto 28px;max-width:140px;height:auto;" />`;
  }
  return `<p style="margin:0 0 28px;text-align:center;font-family:${FONT};font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#5c564e;">${product}</p>`;
}

function otpSlot(code: string, locale: EmailLocale): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;background:#f7f6f2;border:1px solid #ddd6cc;border-radius:8px;">
  <tr><td align="center" style="padding:20px 16px;">
    <p style="margin:0 0 8px;font-family:${FONT};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5c564e;">${OTP_LABEL[locale]}</p>
    <p style="margin:0;font-family:${FONT_MONO};font-size:32px;letter-spacing:0.18em;font-weight:600;color:#1c1915;">${escapeHtml(code)}</p>
  </td></tr>
</table>`;
}

function ctaSlot(href: string, locale: EmailLocale): string {
  const url = escapeHtml(href);
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 16px;">
  <tr><td align="center">
    <a href="${url}" style="display:inline-block;background:#1f3d38;color:#f7f6f2;text-decoration:none;padding:14px 28px;border-radius:6px;font-family:${FONT};font-size:16px;font-weight:600;">${CTA_LABEL[locale]}</a>
  </td></tr>
  <tr><td align="center" style="padding-top:12px;">
    <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.5;color:#5c564e;word-break:break-all;">${url}</p>
  </td></tr>
</table>`;
}

function quoteSlot(name: string, email: string, phone: string, message: string): string {
  const title = name || email;
  const emailLine =
    name && email
      ? `<p style="margin:0 0 ${phone ? '4px' : '12px'};font-family:${FONT};font-size:13px;color:#5c564e;">${escapeHtml(email)}</p>`
      : '';
  const phoneLine = phone
    ? `<p style="margin:0 0 12px;font-family:${FONT};font-size:13px;color:#5c564e;">${escapeHtml(phone)}</p>`
    : '';
  const titleGap = name && email ? '4px' : phone ? '4px' : '12px';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px auto 24px;max-width:420px;text-align:left;">
  <tr><td style="padding:4px 0 4px 16px;border-left:3px solid #c45c26;">
    <p style="margin:0 0 ${titleGap};font-family:${FONT};font-size:16px;font-weight:600;color:#1c1915;">${escapeHtml(title)}</p>
    ${emailLine}
    ${phoneLine}
    <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.6;color:#1c1915;white-space:pre-wrap;">${escapeHtml(message)}</p>
  </td></tr>
</table>`;
}

function slotHtml(kind: EmailKind, locale: EmailLocale, vars: Record<string, string>): string {
  const slot = KIND_SLOT[kind];
  if (slot === 'otp') {
    return otpSlot(vars.code || '', locale);
  }
  if (slot === 'cta') {
    return ctaSlot(vars.login_url || '', locale);
  }
  return quoteSlot(vars.sender_name || '', vars.sender_email || '', vars.sender_phone || '', vars.message || '');
}

export function renderMailHtml(input: {
  kind: EmailKind;
  locale: EmailLocale;
  heading: string;
  body: string;
  vars: Record<string, string>;
  settings: MailEnvelope;
}): string {
  const product = escapeHtml(input.settings.product_name || 'Community');
  const support = input.settings.support_url;
  const heading = escapeHtml(input.heading);
  const footer = support
    ? `<a href="${escapeHtml(support)}" style="font-family:${FONT};color:#c45c26;text-decoration:none;">${product}</a>`
    : `<span style="font-family:${FONT};">${product}</span>`;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f3f0ea;font-family:${FONT};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f0ea;font-family:${FONT};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fffcf7;border:1px solid #ddd6cc;border-radius:12px;font-family:${FONT};">
      <tr><td align="center" style="padding:40px 36px 8px;font-family:${FONT};">
        ${brandBlock(input.settings)}
        <h1 style="margin:0 0 16px;font-family:${FONT};font-size:22px;line-height:1.35;font-weight:600;color:#1c1915;text-align:center;">${heading}</h1>
        ${paragraphsHtml(input.body)}
        ${slotHtml(input.kind, input.locale, input.vars)}
      </td></tr>
      <tr><td align="center" style="padding:8px 36px 32px;font-family:${FONT};">
        <p style="margin:0;padding-top:20px;border-top:1px solid #ddd6cc;font-family:${FONT};font-size:12px;line-height:1.5;color:#5c564e;text-align:center;">${footer}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function renderMailText(input: {
  kind: EmailKind;
  locale: EmailLocale;
  heading: string;
  body: string;
  vars: Record<string, string>;
  settings: MailEnvelope;
}): string {
  const lines = [input.heading, '', input.body];
  const slot = KIND_SLOT[input.kind];
  if (slot === 'otp') {
    lines.push('', `${OTP_LABEL[input.locale]}: ${input.vars.code || ''}`);
  } else if (slot === 'cta') {
    lines.push('', `${CTA_LABEL[input.locale]}: ${input.vars.login_url || ''}`);
  } else {
    const name = input.vars.sender_name || '';
    const email = input.vars.sender_email || '';
    const who = name ? `${name} <${email}>` : email;
    lines.push('', who);
    if (input.vars.sender_phone) {
      lines.push(input.vars.sender_phone);
    }
    lines.push('', input.vars.message || '');
  }
  lines.push('', '--', input.settings.product_name || 'Community');
  if (input.settings.support_url) {
    lines.push(input.settings.support_url);
  }
  return lines.join('\n');
}
