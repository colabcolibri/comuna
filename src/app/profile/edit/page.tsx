'use client';

import React, { useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
    <main className="max-w-4xl mx-auto py-8 px-4 font-sans space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.profile.title}</h1>
        <p className="text-slate-500">{t.profile.subtitle}</p>
      </header>

      {saved && (
        <AppAlertTemplate
          variant="success"
          title="Perfil Atualizado!"
          message={t.profile.savedSuccess}
        />
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <AppCardTemplate
          title={t.profile.personalTitle}
          content={
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">{t.profile.fullName}</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t.profile.birthCity}</label>
                  <Input
                    type="text"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t.profile.currentCity}</label>
                  <Input
                    type="text"
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">{t.profile.gender}</label>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Não-binário">Não-binário</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </Select>
              </div>
            </div>
          }
        />

        {/* Seção de Conteúdo Bilíngue (PT & EN) */}
        <AppCardTemplate
          title="🇧🇷 🇺🇸 Conteúdo do Perfil em 2 Idiomas (Bilingual Profile Content)"
          subtitle="Insira seu título e bio em Português e Inglês para recrutadores locais e internacionais."
          content={
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t.profile.headlinePt}</label>
                  <Input
                    type="text"
                    value={headlinePt}
                    onChange={(e) => setHeadlinePt(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t.profile.headlineEn}</label>
                  <Input
                    type="text"
                    value={headlineEn}
                    onChange={(e) => setHeadlineEn(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t.profile.bioPt}</label>
                  <Textarea
                    rows={4}
                    value={bioPt}
                    onChange={(e) => setBioPt(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">{t.profile.bioEn}</label>
                  <Textarea
                    rows={4}
                    value={bioEn}
                    onChange={(e) => setBioEn(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <Checkbox
                  id="showcase-check"
                  checked={isPublicShowcase}
                  onChange={(e) => setIsPublicShowcase(e.target.checked)}
                />
                <label htmlFor="showcase-check" className="text-sm font-medium text-slate-900 cursor-pointer">
                  {t.profile.publicShowcase}
                </label>
              </div>
            </div>
          }
          footer={
            <div className="w-full flex justify-end">
              <Button type="submit">{t.profile.saveBtn}</Button>
            </div>
          }
        />
      </form>
    </main>
  );
}
