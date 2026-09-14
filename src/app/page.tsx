import React from 'react';
import AppOtpForm from '@/components/AppOtpForm';

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>🌐 Alumni & Community Network Platform</h1>
        <div>
          <span style={{ background: '#e2e8f0', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', color: '#475569' }}>
            Next.js App Router (Porta 3014)
          </span>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Formulário Interativo de Login */}
        <AppOtpForm />

        {/* Status dos Serviços Locais */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.125rem', color: '#1e293b', marginTop: 0 }}>Status dos Serviços Locais</h2>
          <ul style={{ lineHeight: '2', color: '#334155', paddingLeft: '1.25rem', margin: 0, fontSize: '0.9375rem' }}>
            <li>🟢 <strong>Aplicação Web:</strong> <code style={{ background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>http://localhost:3014</code></li>
            <li>🐘 <strong>PostgreSQL (v18.6 Docker):</strong> Porta <code>5433</code> (Database: <code>alumni_db</code>)</li>
            <li>📬 <strong>Mailpit (Captura de OTP):</strong> <a href="http://localhost:8026" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>http://localhost:8026</a> (SMTP: <code>1026</code>)</li>
          </ul>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.875rem', color: '#1e40af' }}>
            <strong>Como Testar:</strong>
            <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
              <li>Digite um e-mail como <code>admin@alumni.org</code> ou seu próprio e-mail no formulário.</li>
              <li>Clique em <strong>Enviar Código por E-mail</strong>.</li>
              <li>Abra o Mailpit em <a href="http://localhost:8026" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>localhost:8026</a> para ver o e-mail ou use o código auto-preenchido no form!</li>
              <li>Clique em <strong>Validar Código</strong> para emitir o Cookie HttpOnly de sessão.</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
