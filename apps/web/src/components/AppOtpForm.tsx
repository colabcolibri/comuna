'use client';

import React, { useState } from 'react';
import { pickContent } from '@community/identity';

const CONTENT = {
  'pt-BR': {
    heading: 'Entrar com código',
    emailLabel: 'E-mail',
    send: 'Enviar código',
    sending: 'Enviando…',
    codeLabel: 'Código de 6 dígitos',
    validate: 'Validar código',
    success: 'Sessão iniciada',
    exit: 'Sair',
  },
  en: {
    heading: 'Sign in with code',
    emailLabel: 'Email',
    send: 'Send code',
    sending: 'Sending…',
    codeLabel: '6-digit code',
    validate: 'Verify code',
    success: 'Signed in',
    exit: 'Sign out',
  },
} as const;

export default function AppOtpForm() {
  const copy = pickContent(CONTENT, 'pt-BR');
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
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Falha ao solicitar código');
      }

      setMessage(data.message);
      if (data.dev_otp) {
        setOtpCode(data.dev_otp); // Preenche automaticamente para testes locais acelerados
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
        body: JSON.stringify({ email, code: otpCode })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Código inválido');
      }

      setMessage('🎉 Login realizado com sucesso! Cookie HttpOnly emitido.');
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
        <h3 style={{ marginTop: 0 }}>✅ Você está autenticado!</h3>
        <p><strong>E-mail:</strong> {authenticatedUser.email}</p>
        <p><strong>Cargo na Rede:</strong> <span style={{ background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{authenticatedUser.role}</span></p>
        <button
          onClick={() => { setAuthenticatedUser(null); setStep('request'); }}
          style={{ background: '#166534', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' }}
        >
          Sair / Fazer outro Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a' }}>{copy.heading}</h3>

      {error && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div style={{ background: '#f0f9ff', color: '#0369a1', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          ℹ️ {message}
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestOtp}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#334155', marginBottom: '0.5rem' }}>Digite seu e-mail para receber o OTP:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin@alumni.org ou aluno@org.com"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #94a3b8', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', width: '100%' }}
          >
            {loading ? 'Enviando...' : 'Enviar Código por E-mail'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#334155', marginBottom: '0.5rem' }}>Digite o Código de 6 dígitos enviado para <strong>{email}</strong>:</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
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
            {loading ? 'Validando...' : 'Validar Código e Fazer Login'}
          </button>
          <button
            type="button"
            onClick={() => setStep('request')}
            style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', width: '100%', fontSize: '0.875rem' }}
          >
            ← Digitar outro e-mail
          </button>
        </form>
      )}

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8125rem', color: '#64748b' }}>
        💡 <strong>Dica de Teste:</strong> Abra o Mailpit no navegador em <a href="http://localhost:8026" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>http://localhost:8026</a> para ver o e-mail capturado!
      </div>
    </div>
  );
}
