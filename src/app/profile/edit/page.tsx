'use client';

import React, { useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function ProfileEditPage() {
  const { t } = useI18n();

  const [fullName, setFullName] = useState('Sergio Luciano Jr');
  const [gender, setGender] = useState('Masculino');
  const [headlinePt, setHeadlinePt] = useState('Engenheiro de Software & Arquiteto AI');
  const [headlineEn, setHeadlineEn] = useState('Software Engineer & AI Architect');
  const [bioPt, setBioPt] = useState('Apaixonado por sistemas distribuídos e plataformas comunitárias.');
  const [bioEn, setBioEn] = useState('Passionate about distributed systems and community platforms.');
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
    <main style={{ maxWidth: '850px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a' }}>{t.profile.title}</h1>
        <p style={{ color: '#64748b' }}>{t.profile.subtitle}</p>
      </header>

      {saved && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AppAlertTemplate
            variant="success"
            title="Perfil Atualizado!"
            message={t.profile.savedSuccess}
          />
        </div>
      )}

      <form onSubmit={handleSave}>
        <AppCardTemplate
          title={t.profile.personalTitle}
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{t.profile.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{t.profile.birthCity}</label>
                  <input
                    type="text"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{t.profile.currentCity}</label>
                  <input
                    type="text"
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>
            </div>
          }
        />

        {/* Seção de Conteúdo Bilíngue (PT & EN) */}
        <div style={{ marginTop: '1.5rem' }}>
          <AppCardTemplate
            title="🇧🇷 🇺🇸 Conteúdo do Perfil em 2 Idiomas (Bilingual Profile Content)"
            subtitle="Insira seu título e bio em Português e Inglês para recrutadores locais e internacionais."
            content={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{t.profile.headlinePt}</label>
                    <input
                      type="text"
                      value={headlinePt}
                      onChange={(e) => setHeadlinePt(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{t.profile.headlineEn}</label>
                    <input
                      type="text"
                      value={headlineEn}
                      onChange={(e) => setHeadlineEn(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{t.profile.bioPt}</label>
                    <textarea
                      rows={4}
                      value={bioPt}
                      onChange={(e) => setBioPt(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{t.profile.bioEn}</label>
                    <textarea
                      rows={4}
                      value={bioEn}
                      onChange={(e) => setBioEn(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
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
                    {t.profile.publicShowcase}
                  </label>
                </div>
              </div>
            }
            footer={
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit">{t.profile.saveBtn}</Button>
              </div>
            }
          />
        </div>
      </form>
    </main>
  );
}
