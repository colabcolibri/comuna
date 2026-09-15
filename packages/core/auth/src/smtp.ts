import nodemailer from 'nodemailer';
import type { SmtpTransportConfig } from './smtp-config';
import { loadSmtpTransportConfig } from './smtp-config';

export type SmtpMessage = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function nodemailerOptions(config: SmtpTransportConfig) {
  const auth = config.user ? { user: config.user, pass: config.pass } : undefined;
  if (config.secure === 'tls') {
    return { host: config.host, port: config.port, secure: true, auth };
  }
  if (config.secure === 'starttls') {
    return { host: config.host, port: config.port, secure: false, requireTLS: true, auth };
  }
  return { host: config.host, port: config.port, secure: false, ignoreTLS: true, auth };
}

export async function sendSmtpMail(
  message: SmtpMessage,
  config: SmtpTransportConfig | null = loadSmtpTransportConfig()
): Promise<void> {
  if (!config) {
    throw new Error('SMTP_NOT_CONFIGURED');
  }
  const transport = nodemailer.createTransport({
    ...nodemailerOptions(config),
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
  try {
    await transport.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    });
  } finally {
    transport.close();
  }
}

export { formatReplyToHeader } from './smtp-headers';
export {
  describeSmtpTransport,
  isSmtpConfigured,
  loadSmtpTransportConfig,
  resolveSmtpSecure,
  type SmtpSecure,
  type SmtpTransportConfig,
  type SmtpTransportView,
} from './smtp-config';
