'use client';

import React, { useEffect, useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { pickContent } from '@community/identity';

const CONTENT = {
  'pt-BR': {
    title: 'Seu perfil',
    subtitle: 'Nome no núcleo. Headline e bio no plugin de diretório.',
    save: 'Salvar',
    saved: 'Perfil atualizado',
    error: 'Não foi possível salvar',
    name: 'Nome completo',
    headline: 'Headline',
    bio: 'Bio',
    availability: 'Disponibilidade',
  },
  en: {
    title: 'Your profile',
    subtitle: 'Name in core. Headline and bio in the directory plugin.',
    save: 'Save',
    saved: 'Profile updated',
    error: 'Could not save',
    name: 'Full name',
    headline: 'Headline',
    bio: 'Bio',
    availability: 'Availability',
  },
} as const;

export default function ProfileEditPage() {
  const copy = pickContent(CONTENT, 'pt-BR');
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/profiles/me'), fetch('/api/memberships/me')])
      .then(async ([profileRes, membershipRes]) => {
        const profileJson = await profileRes.json();
        const membershipJson = await membershipRes.json();
        if (profileJson.profile) {
          setFullName(profileJson.profile.full_name || '');
        }
        if (membershipJson.card) {
          setHeadline(membershipJson.card.headline || '');
          setBio(membershipJson.card.bio || '');
          setAvailability(membershipJson.card.availability_status || '');
        }
      })
      .catch(() => setError(copy.error));
  }, [copy.error]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const profileRes = await fetch('/api/profiles/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, preferred_locale: 'pt-BR' }),
    });
    if (!profileRes.ok) {
      const data = await profileRes.json();
      setError(data.error?.message || copy.error);
      return;
    }
    await fetch('/api/memberships/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headline, bio, availability_status: availability, public_showcase: true }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold m-0">{copy.title}</h1>
        <p style={{ color: '#475569' }}>{copy.subtitle}</p>
      </header>
      {saved && <AppAlertTemplate variant="success" title={copy.saved} message={copy.saved} />}
      {error && <AppAlertTemplate variant="destructive" title={copy.error} message={error} />}
      <form onSubmit={handleSave} className="space-y-6">
        <AppCardTemplate
          title={copy.title}
          content={
            <div className="space-y-4">
              <label className="block text-sm">
                {copy.name}
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </label>
              <label className="block text-sm">
                {copy.headline}
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </label>
              <label className="block text-sm">
                {copy.bio}
                <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
              </label>
              <label className="block text-sm">
                {copy.availability}
                <Input value={availability} onChange={(e) => setAvailability(e.target.value)} />
              </label>
            </div>
          }
          footer={
            <div className="w-full flex justify-end">
              <Button type="submit">{copy.save}</Button>
            </div>
          }
        />
      </form>
    </main>
  );
}
