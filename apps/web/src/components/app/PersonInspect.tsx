'use client';

import { useState, type FormEvent } from 'react';
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogHeader, AppSheet, personInitials } from '@community/ui-member';
import { Button, DialogTitle, Input, Label, Textarea, toast } from '@community/ui';
import { projectPersonView, type ListField } from '@community/directory';
import { displayPlaceLocality } from '@community/places';
import { availabilityLabel } from '@/lib/people/availability';
import { sendPersonContact } from '@/lib/api/contact';
import type { PersonCard } from '@/lib/people/person-card';

export function PersonInspect({
  profile,
  listFields,
  copy,
  locale,
  canContact,
  onClose,
}: {
  profile: PersonCard | null;
  listFields: ListField[];
  copy: Record<string, string>;
  locale: string;
  canContact: boolean;
  onClose: () => void;
}) {
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [contactOpen, setContactOpen] = useState(false);

  const resetContact = () => {
    setSenderEmail('');
    setMessage('');
    setFieldError('');
  };

  const closeAll = () => {
    resetContact();
    setContactOpen(false);
    onClose();
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError('');
    if (!senderEmail.includes('@')) {
      setFieldError(copy.email);
      return;
    }
    if (!profile) return;
    const sent = await sendPersonContact(profile.id, {
      sender_email: senderEmail,
      sender_name: senderEmail,
      message,
    });
    if (!sent.ok) {
      setFieldError(sent.message || copy.message);
      return;
    }
    toast.success(copy.success);
    resetContact();
    setContactOpen(false);
  };

  const view = profile
    ? projectPersonView({
        profile,
        fields: listFields,
        density: 'detail',
        locale,
        cityLabel: displayPlaceLocality(profile.current_city, locale),
        availabilityLabel: availabilityLabel(profile.availability_status, copy),
      })
    : null;

  return (
    <AppDialog open={!!profile} onClose={closeAll} size="lg">
      <AppDialogHeader>
        {profile && view ? (
          <div className="flex min-w-0 items-start gap-4">
            {view.photoUrl ? (
              <img src={view.photoUrl} alt="" className="size-14 shrink-0 rounded-full object-cover" />
            ) : (
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
                aria-hidden
              >
                {personInitials(view.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle className="tracking-tight text-foreground">{view.name}</DialogTitle>
              {view.city ? <p className="mt-1 text-base text-muted-foreground">{view.city}</p> : null}
            </div>
          </div>
        ) : null}
      </AppDialogHeader>
      <AppDialogBody>
        {view ? (
          <div className="space-y-6">
            {view.headline ? <p className="text-base font-medium text-foreground">{view.headline}</p> : null}
            {view.summary ? <p className="text-base leading-relaxed text-foreground">{view.summary}</p> : null}
            {view.languages.length > 0 ? (
              <section className="min-w-0 space-y-2">
                <h3 className="text-sm font-medium text-foreground">{copy.languages}</h3>
                <ul className="flex flex-wrap gap-2">
                  {view.languages.map((item) => (
                    <li key={item.code} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-sm">
                      {item.label}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {view.availability ? <p className="text-sm text-foreground">{view.availability}</p> : null}
            {view.facts.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {view.facts.map((item) => (
                  <li key={item.name} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-sm">
                    {item.value}
                  </li>
                ))}
              </ul>
            ) : null}
            {view.links.length > 0 ? (
              <ul className="flex flex-col gap-2 text-sm">
                {view.links.map((item) => (
                  <li key={item.key}>
                    <a href={item.href} className="underline" rel="noreferrer" target="_blank">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </AppDialogBody>
      <AppDialogFooter>
        <Button variant="outline" className="min-h-11" type="button" onClick={closeAll}>
          {copy.close}
        </Button>
        {canContact && profile ? (
          <AppSheet
            trigger={
              <Button className="min-h-11" type="button">
                {copy.contact}
              </Button>
            }
            title={copy.contact}
            description={copy.privacy}
            closeLabel={copy.cancel}
            open={contactOpen}
            onOpenChange={(next) => {
              setContactOpen(next);
              if (!next) {
                resetContact();
              }
            }}
            footer={
              <Button type="submit" form="person-inspect-contact" className="min-h-11">
                {copy.send}
              </Button>
            }
          >
            <form id="person-inspect-contact" onSubmit={handleSendMessage} className="grid gap-3">
              {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
              <div className="grid gap-3">
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
              <div className="grid gap-3">
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
        ) : null}
      </AppDialogFooter>
    </AppDialog>
  );
}
