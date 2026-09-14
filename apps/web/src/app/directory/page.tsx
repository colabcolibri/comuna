'use client';

import React, { useEffect, useState } from 'react';
import { pickContent } from '@community/identity';

const CONTENT = {
  'pt-BR': {
    title: 'Encontre pessoas da rede',
    subtitle: 'Diretório intermediado. Contato sem e-mail público.',
    search: 'Buscar por nome ou headline',
    empty: 'Nenhum membro ativo nesta comunidade.',
    off: 'Módulo de diretório desligado.',
    privacy: 'Contato intermediado. O e-mail direto não aparece aqui.',
    view: 'Ver perfil',
  },
  en: {
    title: 'Find people in the network',
    subtitle: 'Mediated directory. No public email.',
    search: 'Search by name or headline',
    empty: 'No active members in this community.',
    off: 'Directory module is off.',
    privacy: 'Mediated contact. Direct email is hidden.',
    view: 'View profile',
  },
} as const;

type MemberRow = {
  id: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  availability_status: string | null;
};

export default function DirectoryPage() {
  const copy = pickContent(CONTENT, 'pt-BR');
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [off, setOff] = useState(false);

  useEffect(() => {
    fetch('/api/profiles').then(async (res) => {
      if (res.status === 404) {
        setOff(true);
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  }, []);

  const filtered = rows.filter((p) =>
    `${p.full_name} ${p.headline || ''} ${p.bio || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-10 overflow-x-hidden">
      <section className="mb-10">
        <h1 className="text-[32px] leading-10 font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl">{copy.subtitle}</p>
        <div className="mt-8 pb-6 border-b border-border">
          <label className="sr-only" htmlFor="global-search">
            {copy.search}
          </label>
          <input
            id="global-search"
            className="w-full min-h-11 px-4 py-2.5 bg-surface border border-border rounded-lg"
            placeholder={copy.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <div className="bg-surface-container-low border border-border rounded-lg p-4 text-sm text-muted-foreground">
            {copy.privacy}
          </div>
        </aside>
        <section className="lg:col-span-9 space-y-4">
          {off && <p>{copy.off}</p>}
          {!off && filtered.length === 0 && <p className="text-muted-foreground">{copy.empty}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((profile) => (
              <article key={profile.id} className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-3">
                <h2 className="font-semibold">{profile.full_name}</h2>
                <p className="text-sm">{profile.headline}</p>
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
                {profile.availability_status && (
                  <span className="inline-flex w-fit text-xs px-2 py-0.5 rounded border border-border">
                    {profile.availability_status}
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
