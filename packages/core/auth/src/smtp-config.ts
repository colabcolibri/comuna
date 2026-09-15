export type SmtpSecure = 'none' | 'starttls' | 'tls';

export type SmtpTransportConfig = {
  host: string;
  port: number;
  secure: SmtpSecure;
  user: string;
  pass: string;
};

export type SmtpTransportView = {
  configured: boolean;
  host: string;
  port: number;
  secure: SmtpSecure;
  auth: boolean;
};

type Env = Record<string, string | undefined>;

export function resolveSmtpSecure(port: number, explicit?: string): SmtpSecure {
  const value = (explicit || '').trim().toLowerCase();
  if (value === 'none' || value === 'starttls' || value === 'tls') {
    return value;
  }
  if (port === 465) {
    return 'tls';
  }
  if (port === 587) {
    return 'starttls';
  }
  return 'none';
}

export function isSmtpConfigured(env: Env = process.env): boolean {
  return Boolean((env.SMTP_HOST || '').trim());
}

export function loadSmtpTransportConfig(env: Env = process.env): SmtpTransportConfig | null {
  const host = (env.SMTP_HOST || '').trim();
  if (!host) {
    return null;
  }
  const port = Number(env.SMTP_PORT || '1026');
  const safePort = Number.isFinite(port) && port > 0 ? port : 1026;
  return {
    host,
    port: safePort,
    secure: resolveSmtpSecure(safePort, env.SMTP_SECURE),
    user: (env.SMTP_USER || '').trim(),
    pass: env.SMTP_PASS || '',
  };
}

export function describeSmtpTransport(env: Env = process.env): SmtpTransportView {
  const config = loadSmtpTransportConfig(env);
  if (!config) {
    return { configured: false, host: '', port: 0, secure: 'none', auth: false };
  }
  return {
    configured: true,
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: Boolean(config.user),
  };
}
