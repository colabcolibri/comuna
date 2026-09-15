import { describe, expect, it } from 'vitest';
import { describeSmtpTransport, isSmtpConfigured, loadSmtpTransportConfig, resolveSmtpSecure } from './smtp-config';

describe('smtp-config', () => {
  it('treats empty host as unconfigured (local without mailpit)', () => {
    expect(isSmtpConfigured({ SMTP_HOST: '' })).toBe(false);
    expect(loadSmtpTransportConfig({ SMTP_HOST: '  ' })).toBeNull();
  });

  it('defaults to mailpit: port 1026 and no tls', () => {
    const config = loadSmtpTransportConfig({ SMTP_HOST: 'localhost' });
    expect(config).toEqual({
      host: 'localhost',
      port: 1026,
      secure: 'none',
      user: '',
      pass: '',
    });
  });

  it('maps well-known ports when SMTP_SECURE is omitted', () => {
    expect(resolveSmtpSecure(465)).toBe('tls');
    expect(resolveSmtpSecure(587)).toBe('starttls');
    expect(resolveSmtpSecure(1026)).toBe('none');
  });

  it('lets SMTP_SECURE override the port heuristic', () => {
    const config = loadSmtpTransportConfig({
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'tls',
      SMTP_USER: 'ops',
      SMTP_PASS: 'secret',
    });
    expect(config?.secure).toBe('tls');
    expect(config?.user).toBe('ops');
    expect(config?.pass).toBe('secret');
  });

  it('describes transport without leaking the password', () => {
    const view = describeSmtpTransport({
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_USER: 'ops',
      SMTP_PASS: 'secret',
    });
    expect(view).toEqual({
      configured: true,
      host: 'smtp.example.com',
      port: 587,
      secure: 'starttls',
      auth: true,
    });
    expect(JSON.stringify(view)).not.toContain('secret');
  });
});
