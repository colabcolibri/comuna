'use client';

import React, { useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppSheetTemplate } from '@/components/templates/AppSheetTemplate';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';

interface ProfileItem {
  id: string;
  name: string;
  headlinePt: string;
  headlineEn: string;
  city: string;
  skills: string[];
  bioPt: string;
  bioEn: string;
  availability: 'available' | 'partner' | 'mentor';
}

const INITIAL_PROFILES: ProfileItem[] = [
  {
    id: '1',
    name: 'Ana Silva',
    headlinePt: 'Engenheira Fullstack Senior',
    headlineEn: 'Senior Fullstack Engineer',
    city: 'São Paulo, SP',
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    bioPt: 'Especialista em arquitetura de microsserviços e sistemas web de alta performance.',
    bioEn: 'Specialist in microservices architecture and high-performance web systems.',
    availability: 'available',
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    headlinePt: 'Gerente de Produto & Especialista UX',
    headlineEn: 'Product Manager & UX Specialist',
    city: 'Florianópolis, SC',
    skills: ['Product Discovery', 'UX Research', 'Scrum', 'Figma'],
    bioPt: 'Focado em conectar necessidades de ex-alunos a produtos digitais intuitivos.',
    bioEn: 'Focused on connecting alumni needs with intuitive digital products.',
    availability: 'partner',
  },
  {
    id: '3',
    name: 'Mariana Costa',
    headlinePt: 'Cientista de Dados & IA',
    headlineEn: 'AI & Data Scientist',
    city: 'Belo Horizonte, MG',
    skills: ['Python', 'PyTorch', 'LLMs', 'SQL'],
    bioPt: 'Pesquisadora aplicada em modelos generativos e redes de ex-alunos.',
    bioEn: 'Applied researcher in generative models and alumni network graphs.',
    availability: 'mentor',
  },
];

export default function DirectoryPage() {
  const { lang, t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<ProfileItem | null>(null);

  const filteredProfiles = INITIAL_PROFILES.filter((p) => {
    const headline = lang === 'pt' ? p.headlinePt : p.headlineEn;
    const bio = lang === 'pt' ? p.bioPt : p.bioEn;
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getAvailabilityBadge = (type: ProfileItem['availability']) => {
    switch (type) {
      case 'available':
        return <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>🟢 {lang === 'pt' ? 'Disponível para contratação' : 'Available for hire'}</span>;
      case 'partner':
        return <span style={{ background: '#e0f2fe', color: '#075985', border: '1px solid #bae6fd', padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>🤝 {lang === 'pt' ? 'Parceiro de Projeto' : 'Project Partner'}</span>;
      case 'mentor':
        return <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>💡 {lang === 'pt' ? 'Mentor da Rede' : 'Network Mentor'}</span>;
    }
  };

  return (
    <main style={{ maxWidth: '1050px', margin: '2.5rem auto', padding: '0 1.5rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{t.directory.title}</h1>
        <p style={{ color: '#475569', fontSize: '1.125rem', margin: 0 }}>{t.directory.subtitle}</p>

        <div style={{ marginTop: '1.5rem' }}>
          <input
            type="text"
            placeholder={t.directory.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1.25rem',
              fontSize: '1rem',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          />
        </div>
      </header>

      {/* Grid de Perfis Estilo Stitch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredProfiles.map((profile) => {
          const headline = lang === 'pt' ? profile.headlinePt : profile.headlineEn;
          const bio = lang === 'pt' ? profile.bioPt : profile.bioEn;

          return (
            <AppCardTemplate
              key={profile.id}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{profile.name}</span>
                  {getAvailabilityBadge(profile.availability)}
                </div>
              }
              subtitle={`${headline} • 📍 ${profile.city}`}
              content={
                <div>
                  <p style={{ fontSize: '0.9375rem', color: '#475569', marginBottom: '1.25rem', lineHeight: '1.5' }}>{bio}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {profile.skills.map((skill) => (
                      <span key={skill} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              }
              footer={
                <Button variant="outline" size="sm" onClick={() => setSelectedProfile(profile)} style={{ width: '100%', borderRadius: '6px' }}>
                  {t.directory.viewFullProfile}
                </Button>
              }
            />
          );
        })}
      </div>

      <AppSheetTemplate
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title={selectedProfile?.name}
        description={`${lang === 'pt' ? selectedProfile?.headlinePt : selectedProfile?.headlineEn} • 📍 ${selectedProfile?.city}`}
        content={
          selectedProfile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div>
                {getAvailabilityBadge(selectedProfile.availability)}
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Bio / Resumo</h4>
                <p style={{ color: '#475569', fontSize: '0.9375rem', margin: 0, lineHeight: '1.6' }}>
                  {lang === 'pt' ? selectedProfile.bioPt : selectedProfile.bioEn}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Habilidades</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedProfile.skills.map((skill) => (
                    <span key={skill} style={{ background: '#0f172a', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>{t.directory.activeMember}</p>
              </div>
            </div>
          )
        }
      />
    </main>
  );
}
