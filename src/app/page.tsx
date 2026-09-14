import React from 'react';

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>🌐 Alumni & Community Network Platform</h1>
        <div>
          <span style={{ background: '#e2e8f0', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', color: '#475569' }}>
            Next.js App Router (Porta 3014)
          </span>
        </div>
      </header>

      <section style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginTop: 0 }}>Status dos Serviços Locais</h2>
        <ul style={{ lineHeight: '1.8', color: '#334155' }}>
          <li>🟢 <strong>Aplicação Web (Next.js):</strong> Rodando em <code>http://localhost:3014</code></li>
          <li>🐘 <strong>PostgreSQL (v18.6 Docker):</strong> Ativo na porta <code>5433</code> (Database: <code>alumni_db</code>)</li>
          <li>📬 <strong>Mailpit (Captura de OTP):</strong> Interface Web em <a href="http://localhost:8026" target="_blank" rel="noreferrer">http://localhost:8026</a> (SMTP na porta <code>1026</code>)</li>
        </ul>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.25rem', background: '#ffffff' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>1. Autenticação Passwordless</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Envio de código OTP de 6 dígitos via e-mail com persistência na tabela <code>verification_tokens</code> e sessão JWT.</p>
        </div>

        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.25rem', background: '#ffffff' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>2. Perfil Multi-Tenant</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Separação em Perfil Pessoal (Cidade Origem/Atual Autocomplete, Idiomas com Nível, Gênero) e Perfil da Rede.</p>
        </div>

        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.25rem', background: '#ffffff' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>3. Vitrine & Contato Mediado</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Exibição de talentos para recrutadores sem expor o e-mail real do ex-aluno para proteção contra scraping.</p>
        </div>
      </section>
    </main>
  );
}
