'use client';

import React, { useState } from 'react';
import { contentFromCatalog, interpolate, pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  heading: 'otp_form.heading',
  emailLabel: 'otp_form.email_label',
  send: 'otp_form.send',
  sending: 'otp_form.sending',
  codeLabel: 'otp_form.code_label',
  validate: 'otp_form.validate',
  validating: 'otp_form.validating',
  success: 'otp_form.success',
  exit: 'otp_form.exit',
  requestFail: 'otp_form.request_fail',
  invalid: 'otp_form.invalid',
  loginOk: 'otp_form.login_ok',
  authenticated: 'otp_form.authenticated',
  emailWord: 'otp_form.email_word',
  role: 'otp_form.role',
  otherLogin: 'otp_form.other_login',
  emailPrompt: 'otp_form.email_prompt',
  emailPlaceholder: 'otp_form.email_placeholder',
  codePrompt: 'otp_form.code_prompt',
  backEmail: 'otp_form.back_email',
  mailpit: 'otp_form.mailpit',
});

export default function AppOtpForm() {
  const copy = pickContent(CONTENT, useLocale());
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || copy.requestFail);
      }

      setMessage(data.message);
      if (data.dev_otp) {
        setOtpCode(data.dev_otp);
      }
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || copy.invalid);
      }

      setMessage(copy.loginOk);
      setAuthenticatedUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authenticatedUser) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '8px', color: '#166534' }}>
        <h3 style={{ marginTop: 0 }}>{copy.authenticated}</h3>
        <p>
          <strong>{copy.emailWord}:</strong> {authenticatedUser.email}
        </p>
        <p>
          <strong>{copy.role}:</strong>{' '}
          <span style={{ background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{authenticatedUser.role}</span>
        </p>
        <button
          onClick={() => {
            setAuthenticatedUser(null);
            setStep('request');
          }}
          style={{ background: '#166534', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
        >
          {copy.otherLogin}
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a' }}>{copy.heading}</h3>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ background: '#f0f9ff', color: '#0369a1', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestOtp}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#334155', marginBottom: '0.5rem' }}>{copy.emailPrompt}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #94a3b8', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', width: '100%' }}
          >
            {loading ? copy.sending : copy.send}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#334155', marginBottom: '0.5rem' }}>
              {interpolate(copy.codePrompt, { email })}
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder={copy.codeLabel}
              maxLength={6}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #94a3b8', fontSize: '1.25rem', letterSpacing: '4px', textAlign: 'center', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', width: '100%', marginBottom: '0.5rem' }}
          >
            {loading ? copy.validating : copy.validate}
          </button>
          <button
            type="button"
            onClick={() => setStep('request')}
            style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', width: '100%', fontSize: '0.875rem' }}
          >
            {copy.backEmail}
          </button>
        </form>
      )}

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8125rem', color: '#64748b' }}>{copy.mailpit}</div>
    </div>
  );
}
