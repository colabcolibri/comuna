export type OtpApiPhase = 'request' | 'verify';

export type OtpApiCopy = {
  rateLimit: string;
  emailInvalid: string;
  mail: string;
  invalid: string;
  requestError: string;
  verifyError: string;
};

export function otpErrorCodeFromBody(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('error' in data)) {
    return undefined;
  }
  const error = (data as { error?: { code?: unknown } }).error;
  return typeof error?.code === 'string' ? error.code : undefined;
}

export function otpUserMessage(phase: OtpApiPhase, code: string | undefined, copy: OtpApiCopy): string {
  if (phase === 'verify') {
    if (code === 'INVALID_OTP' || code === 'VALIDATION_ERROR') {
      return copy.invalid;
    }
    return copy.verifyError;
  }
  if (code === 'RATE_LIMIT_EXCEEDED') {
    return copy.rateLimit;
  }
  if (code === 'VALIDATION_ERROR') {
    return copy.emailInvalid;
  }
  if (code === 'MAIL_FAILED') {
    return copy.mail;
  }
  return copy.requestError;
}
