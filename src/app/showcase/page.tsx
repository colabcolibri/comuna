'use client';

import React, { useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppDialogTemplate } from '@/components/templates/AppDialogTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { Button } from '@/components/ui/button';

interface ShowcaseProfile {
  id: string;
  name: string;
  headline: string;
  city: string;
  skills: string[];
}

const PUBLIC_PROFILES: ShowcaseProfile[] = [
  {
    id: '1',
    name: 'Ana Silva',
    headline: 'Senior Fullstack Engineer',
    city: 'São Paulo, SP',
    skills: ['React', 'Node.js', 'TypeScript'],
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    headline: 'Product Manager',
    city: 'Florianópolis, SC',
    skills: ['Product Discovery', 'UX Research'],
  },
];

export default function ShowcasePage() {
  const [selectedProfile, setSelectedProfile] = useState<ShowcaseProfile | null>(null);
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setSelectedProfile(null);
      setSenderEmail('');
      setMessage('');
    }, 2500);
  };

  return (
    <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0f172a' }}>✨ Vitrine Pública de Talentos Alumni</h1>
        <p style={{ color: '#64748b', fontSize: '1.125rem' }}>Conecte-se com ex-alunos qualificados através de mensagens mediadas pela plataforma.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {PUBLIC_PROFILES.map((profile) => (
          <AppCardTemplate
            key={profile.id}
            title={profile.name}
            subtitle={`${profile.headline} • ${profile.city}`}
            content={
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0' }}>
                {profile.skills.map((skill) => (
                  <span key={skill} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            }
            footer={
              <Button style={{ width: '100%' }} onClick={() => setSelectedProfile(profile)}>
                ✉️ Enviar Mensagem Mediada
              </Button>
            }
          />
        ))}
      </div>

      <AppDialogTemplate
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title={`Contato Mediado com ${selectedProfile?.name}`}
        description="Sua mensagem será entregue ao e-mail do ex-aluno sem expor o endereço pessoal dele a você."
        content={
          sentSuccess ? (
            <AppAlertTemplate variant="success" title="Mensagem Enviada!" message="O e-mail foi disparado via Mailpit com sucesso." />
          ) : (
            <form id="contact-form" onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Seu E-mail (Recrutador / Contratante)</label>
                <input
                  type="email"
                  required
                  placeholder="recrutador@empresa.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Mensagem / Proposta de Oportunidade</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Olá, vi seu perfil na vitrine Alumni e gostaria de conversar..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </form>
          )
        }
        actions={
          !sentSuccess && (
            <>
              <Button variant="outline" onClick={() => setSelectedProfile(null)}>Cancelar</Button>
              <Button type="submit" form="contact-form">Enviar E-mail</Button>
            </>
          )
        }
      />
    </main>
  );
}
