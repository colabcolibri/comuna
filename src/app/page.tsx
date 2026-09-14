'use client';

import React, { useState } from 'react';
import AppOtpForm from '@/components/AppOtpForm';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
          {t.home.title}
        </h1>
        <p style={{ color: '#475569', fontSize: '1.125rem', margin: 0 }}>
          {t.home.subtitle}
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Formulário Interativo de Login OTP */}
        <AppOtpForm />

        {/* Painel de Status dos Serviços Locais */}
        <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginTop: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            {t.home.localStatus}
          </h2>
          <ul style={{ lineHeight: '2.2', color: '#334155', paddingLeft: '1.25rem', margin: '1rem 0 0 0', fontSize: '0.9375rem' }}>
            <li>🟢 <strong>{t.home.webApp}:</strong> <code style={{ background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>http://localhost:3014</code></li>
            <li>🐘 <strong>PostgreSQL (v18.6 Docker):</strong> Porta <code>5433</code> (Database: <code>alumni_db</code>)</li>
            <li>📬 <strong>{t.home.mailpit}:</strong> <a href="http://localhost:8026" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>http://localhost:8026</a> (SMTP: <code>1026</code>)</li>
          </ul>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.875rem', color: '#0369a1' }}>
            <strong>💡 Instruções de Teste:</strong>
            <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
              <li>Insira seu e-mail ou <code>admin@alumni.org</code> para receber a OTP.</li>
              <li>Abra o Mailpit em <a href="http://localhost:8026" target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>localhost:8026</a> para ver o e-mail ou use o auto-preenchimento.</li>
              <li>Valide o código para emitir a sessão JWT no cookie HttpOnly.</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
