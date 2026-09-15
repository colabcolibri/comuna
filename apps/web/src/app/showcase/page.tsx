'use client';

import React, { useEffect, useState } from 'react';
import {
  AppDialog,
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  AppPageTemplate,
  AppSheet,
  AppShowcaseCard,
  AppShowcaseGrid,
} from '@community/ui-member';
import { Button, Input, Label, Textarea, toast } from '@community/ui';
import { contentFromCatalog, mergeContent, parseLanguages, pickContent, pickLocalizedText } from '@community/identity';
import { displayPlaceLocality } from '@community/places';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { uiCatalog } from '@/lang/catalog';
import { slotOn } from '@/modules/registry';
import type { PublicShowcaseProfile } from '@/lib/showcase/publicProfiles';
import { availabilityLabel } from '@/lib/people/availability';

const CONTENT = mergeContent(
  contentFromCatalog(uiCatalog, 'plugin_showcase', {
    kicker: 'page.kicker',
    title: 'page.title',
    subtitle: 'page.subtitle',
    empty: 'page.empty',
    view: 'page.view',
    close: 'page.close',
    privacy: 'page.privacy',
    langPt: 'lang.pt',
    langEn: 'lang.en',
    langEs: 'lang.es',
    langFr: 'lang.fr',
    hire: 'avail.available_for_hire',
    partner: 'avail.project_partner',
    mentor: 'avail.mentor',
    unavailable: 'avail.unavailable',
    host: 'host.yes',
    linkedin: 'link.linkedin',
    github: 'link.github',
    portfolio: 'link.portfolio',
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

function languageLabel(code: string, copy: Record<string, string>) {
  if (code === 'pt') return copy.langPt;
  if (code === 'en') return copy.langEn;
  if (code === 'es') return copy.langEs;
  if (code === 'fr') return copy.langFr;
  return null;
}

function profileChips(profile: PublicShowcaseProfile, copy: Record<string, string>) {
  const chips: string[] = [];
  const availability = availabilityLabel(profile.availability_status, copy);
  if (availability) {
    chips.push(availability);
  }
  for (const item of parseLanguages(profile.languages)) {
    const label = languageLabel(item.code, copy);
    if (label) {
      chips.push(label);
    }
  }
  return chips;
}

function useWideScreen() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 640px)');
    const apply = () => setWide(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);
  return wide;
}

export default function ShowcasePage() {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const enabled = useEnabledModules();
  const canContact = slotOn(enabled, SHOWCASE_ROW_ACTION);
  const wide = useWideScreen();
  const [rows, setRows] = useState<PublicShowcaseProfile[]>([]);
  const [selected, setSelected] = useState<PublicShowcaseProfile | null>(null);
  const [composing, setComposing] = useState(false);
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
    setComposing(false);
    setSelected(null);
    setSenderEmail('');
    setMessage('');
    setFieldError('');
  };

  const closeProfile = () => {
    setComposing(false);
    setSelected(null);
    setFieldError('');
  };

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        <AppShowcaseGrid>
          {rows.map((profile) => {
            const headline = pickLocalizedText(profile.headline, locale);
            const summary = pickLocalizedText(profile.bio, locale);
            return (
              <AppShowcaseCard
                key={profile.id}
                name={profile.full_name}
                photoUrl={profile.avatar_url}
                headline={headline}
                summary={summary}
                city={displayPlaceLocality(profile.current_city, locale)}
                chips={profileChips(profile, copy)}
                action={
                  <Button variant="outline" className="min-h-11 w-full" onClick={() => setSelected(profile)}>
                    {copy.view}
                  </Button>
                }
              />
            );
          })}
        </AppShowcaseGrid>
      )}
      <AppDialog open={!!selected} onClose={closeProfile} size="lg">
        <AppDialogHeader
          title={selected?.full_name}
          description={selected ? displayPlaceLocality(selected.current_city, locale) : undefined}
        />
        <AppDialogBody>
          {selected ? (
            <div className="space-y-6">
              {pickLocalizedText(selected.headline, locale) ? (
                <p className="text-base font-medium text-foreground">{pickLocalizedText(selected.headline, locale)}</p>
              ) : null}
              {pickLocalizedText(selected.bio, locale) ? (
                <p className="text-base leading-relaxed text-foreground">{pickLocalizedText(selected.bio, locale)}</p>
              ) : null}
              <ul className="flex flex-wrap gap-2">
                {profileChips(selected, copy).map((chip) => (
                  <li key={chip} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-sm">
                    {chip}
                  </li>
                ))}
                {selected.custom_attributes.host_at_home ? (
                  <li className="rounded-md border border-border bg-secondary px-2.5 py-1 text-sm">{copy.host}</li>
                ) : null}
              </ul>
              <ul className="flex flex-col gap-2 text-sm">
                {Object.entries(selected.contacts).map(([key, href]) => (
                  <li key={key}>
                    <a href={href} className="underline" rel="noreferrer" target="_blank">
                      {key === 'linkedin' ? copy.linkedin : key === 'github' ? copy.github : copy.portfolio}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </AppDialogBody>
        <AppDialogFooter>
          <Button variant="outline" className="min-h-11" type="button" onClick={closeProfile}>
            {copy.close}
          </Button>
          {canContact ? (
            <Button className="min-h-11" type="button" onClick={() => setComposing(true)}>
              {copy.contact}
            </Button>
          ) : null}
        </AppDialogFooter>
      </AppDialog>
      <AppSheet
        open={composing && !!selected}
        onClose={() => {
          setComposing(false);
          setFieldError('');
        }}
        side={wide ? 'right' : 'bottom'}
        title={copy.contact}
        description={copy.privacy}
        footer={
          <>
            <Button
              variant="outline"
              className="min-h-11"
              type="button"
              onClick={() => {
                setComposing(false);
                setFieldError('');
              }}
            >
              {copy.cancel}
            </Button>
            <Button type="submit" form="contact-form" className="min-h-11">
              {copy.send}
            </Button>
          </>
        }
      >
        <form id="contact-form" onSubmit={handleSendMessage} className="space-y-4">
          {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="contact-email">{copy.email}</Label>
            <Input
              id="contact-email"
              className="min-h-11"
              type="email"
              required
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">{copy.message}</Label>
            <Textarea
              id="contact-message"
              className="min-h-32"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </form>
      </AppSheet>
    </AppPageTemplate>
  );
}
