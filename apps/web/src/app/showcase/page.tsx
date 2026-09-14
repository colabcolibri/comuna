'use client';

import React, { useEffect, useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppDialogTemplate } from '@/components/templates/AppDialogTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { Button } from '@community/ui';
import { pickContent } from '@community/identity';

const CONTENT = {
  'pt-BR': {
    title: 'Vitrine pública',
    subtitle: 'Campos públicos. Sem e-mail do membro.',
    contact: 'Enviar mensagem',
    cancel: 'Cancelar',
    send: 'Enviar',
    success: 'Mensagem enviada',
    email: 'Seu e-mail',
    message: 'Mensagem',
    off: 'Módulo de vitrine desligado.',
  },
  en: {
    title: 'Public showcase',
    subtitle: 'Public fields only. No member email.',
    contact: 'Send message',
    cancel: 'Cancel',
    send: 'Send',
    success: 'Message sent',
    email: 'Your email',
    message: 'Message',
    off: 'Showcase module is off.',
  },
} as const;

type Row = { id: string; full_name: string; headline: string | null };

export default function ShowcasePage() {
  const copy = pickContent(CONTENT, 'pt-BR');
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [off, setOff] = useState(false);

  useEffect(() => {
    fetch('/api/profiles/public')
      .then(async (res) => {
        if (res.status === 404) {
          setOff(true);
          return;
        }
        const json = await res.json();
        setRows(json.data || []);
      })
      .catch(() => setRows([]));
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');
    if (!senderEmail.includes('@')) {
      setFieldError(copy.email);
      return;
    }
    if (!selected) return;
    const res = await fetch(`/api/profiles/${selected.id}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_email: senderEmail, sender_name: senderEmail, message }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFieldError(data.error?.message || copy.message);
      return;
    }
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setSelected(null);
      setSenderEmail('');
      setMessage('');
    }, 2000);
  };

  return (
    <main className="max-w-[1000px] mx-auto my-8 px-4 overflow-x-hidden">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold">{copy.title}</h1>
        <p style={{ color: '#475569' }}>{copy.subtitle}</p>
      </header>
      {off && <p>{copy.off}</p>}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
        {rows.map((profile) => (
          <AppCardTemplate
            key={profile.id}
            title={profile.full_name}
            subtitle={profile.headline || ''}
            footer={
              <Button className="w-full" onClick={() => setSelected(profile)}>
                {copy.contact}
              </Button>
            }
          />
        ))}
      </div>
      <AppDialogTemplate
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={copy.contact}
        description={copy.subtitle}
        content={
          sentSuccess ? (
            <AppAlertTemplate variant="success" title={copy.success} message={copy.success} />
          ) : (
            <form id="contact-form" onSubmit={handleSendMessage} className="flex flex-col gap-4">
              {fieldError && <p style={{ color: '#b91c1c' }}>{fieldError}</p>}
              <label className="text-sm">
                {copy.email}
                <input
                  className="w-full box-border p-2 rounded border"
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                />
              </label>
              <label className="text-sm">
                {copy.message}
                <textarea
                  className="w-full box-border p-2 rounded border"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
            </form>
          )
        }
        actions={
          !sentSuccess && (
            <>
              <Button variant="outline" onClick={() => setSelected(null)}>
                {copy.cancel}
              </Button>
              <Button type="submit" form="contact-form">
                {copy.send}
              </Button>
            </>
          )
        }
      />
    </main>
  );
}
