import { describe, expect, it } from 'vitest';
import { otpErrorCodeFromBody, otpUserMessage } from './otp-api-error';

const copy = {
  rateLimit: 'rate',
  emailInvalid: 'email',
  mail: 'mail',
  invalid: 'invalid',
  requestError: 'request',
  verifyError: 'verify',
};

describe('otpErrorCodeFromBody', () => {
  it('reads error.code', () => {
    expect(otpErrorCodeFromBody({ error: { code: 'MAIL_FAILED' } })).toBe('MAIL_FAILED');
  });

  it('ignores missing envelope', () => {
    expect(otpErrorCodeFromBody({ message: 'Código enviado' })).toBeUndefined();
  });
});

describe('otpUserMessage', () => {
  it('maps request codes', () => {
    expect(otpUserMessage('request', 'RATE_LIMIT_EXCEEDED', copy)).toBe('rate');
    expect(otpUserMessage('request', 'VALIDATION_ERROR', copy)).toBe('email');
    expect(otpUserMessage('request', 'MAIL_FAILED', copy)).toBe('mail');
    expect(otpUserMessage('request', 'SERVER_ERROR', copy)).toBe('request');
  });

  it('maps verify codes without leaking request copy', () => {
    expect(otpUserMessage('verify', 'INVALID_OTP', copy)).toBe('invalid');
    expect(otpUserMessage('verify', 'SERVER_ERROR', copy)).toBe('verify');
  });
});
