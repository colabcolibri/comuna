'use client';

import React, { useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppSheetTemplate } from '@/components/templates/AppSheetTemplate';
import { Button } from '@/components/ui/button';

interface ProfileItem {
  id: string;
  name: string;
  headline: string;
  city: string;
  skills: string[];
  bio: string;
}

const INITIAL_PROFILES: ProfileItem[] = [
  {
    id: '1',
    name: 'Ana Silva',
    headline: 'Senior Fullstack Engineer',
    city: 'São Paulo, SP',
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    bio: 'Desenvolvedora especialista em arquitetura de microsserviços e sistemas web de alta performance.',
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    headline: 'Product Manager & UX Specialist',
    city: 'Florianópolis, SC',
    skills: ['Product Discovery', 'UX Research', 'Scrum', 'Figma'],
    bio: 'Focado em conectar necessidades de ex-alunos a produtos digitais intuitivos e centrados no usuário.',
  },
  {
    id: '3',
    name: 'Mariana Costa',
    headline: 'AI & Data Scientist',
    city: 'Belo Horizonte, MG',
    skills: ['Python', 'PyTorch', 'LLMs', 'SQL'],
    bio: 'Pesquisadora aplicada em modelos generativos e análise de redes sociais de ex-alunos.',
  },
];

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<ProfileItem | null>(null);

  const filteredProfiles = INITIAL_PROFILES.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a' }}>🔍 Diretório Interno de Talentos</h1>
        <p style={{ color: '#64748b' }}>Conecte-se e encontre membros da sua rede por habilidade, nome ou cidade.</p>

        <div style={{ marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar por nome, habilidade (ex: React) ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
          />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredProfiles.map((profile) => (
          <AppCardTemplate
            key={profile.id}
            title={profile.name}
            subtitle={`${profile.headline} • ${profile.city}`}
            content={
              <div>
                <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>{profile.bio}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.skills.map((skill) => (
                    <span key={skill} style={{ background: '#e2e8f0', color: '#1e293b', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            }
            footer={
              <Button variant="outline" size="sm" onClick={() => setSelectedProfile(profile)} style={{ width: '100%' }}>
                Ver Perfil Completo
              </Button>
            }
          />
        ))}
      </div>

      <AppSheetTemplate
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title={selectedProfile?.name}
        description={`${selectedProfile?.headline} • ${selectedProfile?.city}`}
        content={
          selectedProfile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#334155' }}>Bio</h4>
                <p style={{ color: '#475569', fontSize: '0.9375rem' }}>{selectedProfile.bio}</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#334155' }}>Habilidades</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedProfile.skills.map((skill) => (
                    <span key={skill} style={{ background: '#0f172a', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>📍 Membro Ativo da Comunidade Alumni</p>
              </div>
            </div>
          )
        }
      />
    </main>
  );
}
