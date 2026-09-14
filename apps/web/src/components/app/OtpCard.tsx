'use client';

import React, { useRef, useState } from 'react';
import { pickContent } from '@community/identity';

const CONTENT = {
  'pt-BR': {
    title: 'Entrar',
    subtitle: 'Digite seu e-mail cadastrado para receber um código de 6 dígitos, sem senha.',
    emailLabel: 'E-mail cadastrado',
    change: 'Alterar',
    send: 'Enviar código',
    sending: 'Enviando…',
    codeLegend: 'Código de 6 dígitos enviado para seu e-mail',
    verify: 'Verificar e entrar',
    verifying: 'Validando…',
    resend: 'Reenviar código',
    spam: 'Não recebeu? Verifique o spam ou solicite um novo envio.',
    privacy: 'Acesso restrito. Seus dados não vão para a vitrine pública.',
    invalid: 'Código inválido ou expirado. Solicite outro.',
    digit: (n: number) => `Dígito ${n} do código`,
  },
  en: {
    title: 'Sign in',
    subtitle: 'Enter your email to receive a 6-digit code. No password.',
    emailLabel: 'Registered email',
    change: 'Change',
    send: 'Send code',
    sending: 'Sending…',
    codeLegend: '6-digit code sent to your email',
    verify: 'Verify and enter',
    verifying: 'Checking…',
    resend: 'Resend code',
    spam: 'Did not get it? Check spam or request a new code.',
    privacy: 'Restricted access. Your data is not listed publicly.',
    invalid: 'Invalid or expired code. Request another.',
    digit: (n: number) => `Digit ${n} of the code`,
  },
} as const;

export default function OtpCard() {
  const copy = pickContent(CONTENT, 'pt-BR');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ email: string; role: string } | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const requestCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || copy.invalid);
      }
      setStep('code');
      setDigits(['', '', '', '', '', '']);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : copy.invalid);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || copy.invalid);
      }
      setDone({ email: data.user.email, role: data.user.global_role });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : copy.invalid);
    } finally {
      setLoading(false);
    }
  };

  const onDigit = (index: number, value: string) => {
    const next = value.replace(/\D/g, '').slice(-1);
    const copyDigits = [...digits];
    copyDigits[index] = next;
    setDigits(copyDigits);
    if (next && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    if (copyDigits.every((d) => d.length === 1)) {
      void verify(copyDigits.join(''));
    }
  };

  const onPaste = (event: React.ClipboardEvent) => {
    const paste = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    event.preventDefault();
    const next = paste.split('');
    while (next.length < 6) next.push('');
    setDigits(next);
    if (paste.length === 6) {
      void verify(paste);
    }
  };

  if (done) {
    return (
      <section className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-8 sm:p-10">
        <h1 className="text-[22px] font-semibold mb-2">{copy.title}</h1>
        <p className="text-muted text-sm">{done.email}</p>
      </section>
    );
  }

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-8 sm:p-10 shadow-sm">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/50 mx-auto mb-4 flex items-center justify-center text-cta">
          @
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight mb-2">{copy.title}</h1>
        <p className="text-sm text-on-surface-variant leading-relaxed">{copy.subtitle}</p>
      </div>

      {step === 'email' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void requestCode();
          }}
          className="space-y-4"
        >
          {error && (
            <p className="flex items-center gap-2 p-2.5 bg-destructive-tint border border-destructive/20 rounded-lg text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
          <label className="block text-sm font-medium">
            {copy.emailLabel}
            <input
              className="mt-2 w-full min-h-12 box-border px-3 rounded-lg border-2 border-outline-variant"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-12 bg-cta text-white font-semibold rounded-lg"
          >
            {loading ? copy.sending : copy.send}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verify(digits.join(''));
          }}
        >
          <div className="mb-6 p-3.5 bg-surface-container-low/80 border border-outline-variant/60 rounded-lg flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-xs text-on-surface-variant">{copy.emailLabel}</span>
              <span className="block truncate font-medium">{email}</span>
            </div>
            <button type="button" className="text-sm font-semibold underline" onClick={() => setStep('email')}>
              {copy.change}
            </button>
          </div>
          <fieldset className="mb-4">
            <legend className="block text-sm font-medium mb-3 text-center">{copy.codeLegend}</legend>
            <div className="flex items-center justify-between gap-2" role="group" onPaste={onPaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputs.current[index] = el;
                  }}
                  aria-label={copy.digit(index + 1)}
                  inputMode="numeric"
                  maxLength={1}
                  className="flex-1 min-w-0 min-h-[52px] text-center text-lg font-semibold border-2 border-outline-variant rounded-lg"
                  value={digit}
                  onChange={(e) => onDigit(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digits[index] && index > 0) {
                      inputs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>
          </fieldset>
          {error && (
            <div className="mb-5 flex items-center gap-2 p-2.5 bg-destructive-tint border border-destructive/20 rounded-lg text-destructive text-sm" role="alert">
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full min-h-12 bg-cta text-white font-semibold rounded-lg">
            {loading ? copy.verifying : copy.verify}
          </button>
          <div className="mt-6 pt-5 border-t border-outline-variant/40 text-center space-y-2">
            <button type="button" className="text-sm font-semibold" onClick={() => void requestCode()}>
              {copy.resend}
            </button>
            <p className="text-xs text-on-surface-variant">{copy.spam}</p>
          </div>
        </form>
      )}
      <div className="mt-6 pt-4 border-t border-outline-variant/30 text-xs text-on-surface-variant">{copy.privacy}</div>
    </section>
  );
}
