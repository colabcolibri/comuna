'use client';

import React, { useEffect, useState } from 'react';
import { AppIndexList, AppPageTemplate, AppPersonRow } from '@community/ui-member';
import { Button, toast } from '@community/ui';
import { contentFromCatalog, mergeContent, pickContent, pickLocalizedText } from '@community/identity';
import { displayPlace } from '@community/places';
import { AppDialogTemplate } from '@/components/templates/AppDialogTemplate';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { uiCatalog } from '@/lang/catalog';
import { slotOn } from '@/modules/registry';

const CONTENT = mergeContent(
  contentFromCatalog(uiCatalog, 'plugin_showcase', {
    kicker: 'page.kicker',
    title: 'page.title',
    subtitle: 'page.subtitle',
  }),
  contentFromCatalog(uiCatalog, 'plugin_contact_mediated', {
    contact: 'form.contact',
    cancel: 'form.cancel',
    send: 'form.send',
    success: 'form.success',
    email: 'form.email',
    message: 'form.message',
  })
);

type Row = { id: string; full_name: string; headline: unknown; current_city: unknown };

export default function ShowcasePage() {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const enabled = useEnabledModules();
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    fetch('/api/profiles/public')
      .then(async (res) => {
        if (res.status === 404) {
          window.location.replace('/');
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
    toast.success(copy.success);
    setSelected(null);
    setSenderEmail('');
    setMessage('');
    setFieldError('');
  };

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <AppIndexList>
          {rows.map((profile) => (
            <AppPersonRow
              key={profile.id}
              name={profile.full_name}
              headline={[
                pickLocalizedText(profile.headline, locale),
                displayPlace(profile.current_city, locale),
              ]
                .filter(Boolean)
                .join(' · ')}
              action={
                slotOn(enabled, SHOWCASE_ROW_ACTION) ? (
                <Button variant="outline" onClick={() => setSelected(profile)}>
                  {copy.contact}
                </Button>
                ) : undefined
              }
            />
          ))}
        </AppIndexList>
      <AppDialogTemplate
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={copy.contact}
        description={copy.subtitle}
        content={
          <form id="contact-form" onSubmit={handleSendMessage} className="flex flex-col gap-4">
              {fieldError && <p className="text-destructive">{fieldError}</p>}
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
        }
        actions={
          <>
              <Button variant="outline" onClick={() => setSelected(null)}>
                {copy.cancel}
              </Button>
              <Button type="submit" form="contact-form">
                {copy.send}
              </Button>
            </>
        }
      />
    </AppPageTemplate>
  );
}
