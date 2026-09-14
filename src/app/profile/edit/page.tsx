'use client';

import React, { useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { Button } from '@/components/ui/button';

export default function ProfileEditPage() {
  const [fullName, setFullName] = useState('Sergio Luciano Jr');
  const [gender, setGender] = useState('Masculino');
  const [headline, setHeadline] = useState('Engenheiro de Software & Arquiteto AI');
  const [bio, setBio] = useState('Passionado por sistemas distribuídos e plataformas comunitárias.');
  const [birthCity, setBirthCity] = useState('São Paulo, SP');
  const [currentCity, setCurrentCity] = useState('Florianópolis, SC');
  const [isPublicShowcase, setIsPublicShowcase] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a' }}>⚙️ Edição de Perfil do Ex-Aluno</h1>
        <p style={{ color: '#64748b' }}>Gerencie suas informações pessoais, localização, habilidades e visibilidade na rede.</p>
      </header>

      {saved && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AppAlertTemplate
            variant="success"
            title="Perfil Atualizado!"
            message="Suas alterações foram salvas com sucesso no banco PostgreSQL."
          />
        </div>
      )}

      <form onSubmit={handleSave}>
        <AppCardTemplate
          title="Informações Pessoais & Localização"
          subtitle="Dados de origem, moradia atual e idiomas."
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Nome Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Cidade de Nascimento (IBGE/OSM)</label>
                  <input
                    type="text"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Cidade Atual (IBGE/OSM)</label>
                  <input
                    type="text"
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Gênero</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Não-binário">Não-binário</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>
            </div>
          }
        />

        <div style={{ marginTop: '1.5rem' }}>
          <AppCardTemplate
            title="Perfil da Rede & Disponibilidade"
            subtitle="Como outros membros e recrutadores enxergam você."
            content={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Título Profissional (Headline)</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Bio / Resumo Profissional</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    id="showcase-check"
                    checked={isPublicShowcase}
                    onChange={(e) => setIsPublicShowcase(e.target.checked)}
                    style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="showcase-check" style={{ fontSize: '0.9375rem', color: '#1e293b', fontWeight: 500, cursor: 'pointer' }}>
                    Exibir meu perfil na Vitrine Pública de Talentos para Recrutadores
                  </label>
                </div>
              </div>
            }
            footer={
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            }
          />
        </div>
      </form>
    </main>
  );
}
