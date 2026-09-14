'use client';

import React, { useEffect, useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { AppPageTemplate } from '@community/ui-member';
import { Button, Input, Label, Textarea } from '@community/ui';
import { pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';

const CONTENT = {
  'pt-BR': {
    title: 'Seu perfil',
    subtitle: 'Nome no núcleo. Headline e bio no plugin de diretório.',
    save: 'Salvar',
    saved: 'Perfil atualizado',
    error: 'Não foi possível salvar',
    name: 'Nome completo',
    avatar: 'URL do avatar',
    locale: 'Idioma preferido',
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
    avatar: 'Avatar URL',
    locale: 'Preferred language',
    headline: 'Headline',
    bio: 'Bio',
    availability: 'Availability',
  },
} as const;

export default function ProfileEditPage() {
  const copy = pickContent(CONTENT, useLocale());
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preferredLocale, setPreferredLocale] = useState('pt-BR');
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
          setAvatarUrl(profileJson.profile.avatar_url || '');
          setPreferredLocale(profileJson.profile.preferred_locale || 'pt-BR');
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
      body: JSON.stringify({
        full_name: fullName,
        avatar_url: avatarUrl || null,
        preferred_locale: preferredLocale,
      }),
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
    <AppPageTemplate title={copy.title} subtitle={copy.subtitle} className="max-w-4xl py-8">
      {saved && <AppAlertTemplate variant="success" title={copy.saved} message={copy.saved} />}
      {error && <AppAlertTemplate variant="destructive" title={copy.error} message={error} />}
      <form onSubmit={handleSave} className="space-y-6">
        <AppCardTemplate
          title={copy.title}
          content={
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{copy.name}</Label>
                <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">{copy.avatar}</Label>
                <Input id="avatar_url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_locale">{copy.locale}</Label>
                <select
                  id="preferred_locale"
                  className="w-full min-h-11 px-3 bg-surface border border-border rounded-lg"
                  value={preferredLocale}
                  onChange={(e) => setPreferredLocale(e.target.value)}
                >
                  <option value="pt-BR">pt-BR</option>
                  <option value="en">en</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">{copy.headline}</Label>
                <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">{copy.bio}</Label>
                <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">{copy.availability}</Label>
                <Input id="availability" value={availability} onChange={(e) => setAvailability(e.target.value)} />
              </div>
            </div>
          }
          footer={
            <div className="w-full flex justify-end">
              <Button type="submit">{copy.save}</Button>
            </div>
          }
        />
      </form>
    </AppPageTemplate>
  );
}
