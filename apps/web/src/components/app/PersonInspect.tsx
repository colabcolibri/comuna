'use client';

import { useState, type FormEvent } from 'react';
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogHeader, AppPersonFieldGroup, AppSheet, personInitials } from '@community/ui-member';
import { Button, DialogTitle, Input, Label, Textarea, toast } from '@community/ui';
import { CONTACT_MESSAGE_MIN, parseContactPayload } from '@community/contact-mediated';
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
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [message, setMessage] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const resetContact = () => {
    setSenderName('');
    setSenderEmail('');
    setSenderPhone('');
    setMessage('');
    setFieldError('');
    setSending(false);
  };

  const closeAll = () => {
    resetContact();
    setContactOpen(false);
    onClose();
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setFieldError('');
    const parsed = parseContactPayload({
      sender_name: senderName,
      sender_email: senderEmail,
      sender_phone: senderPhone,
      message,
    });
    if (!parsed.ok) {
      setFieldError(parsed.reason === 'message_min' ? copy.messageMin : copy.requiredMissing);
      return;
    }
    if (!profile) return;
    setSending(true);
    const sent = await sendPersonContact(profile.id, {
      sender_email: parsed.value.senderEmail,
      sender_name: parsed.value.senderName,
      sender_phone: parsed.value.senderPhone,
      message: parsed.value.message,
    });
    if (!sent.ok) {
      setSending(false);
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
  const hasMeta = Boolean(
    view && (view.languages.length > 0 || view.availability || view.facts.length > 0 || view.links.length > 0)
  );
  const split = Boolean((view?.headline || view?.summary) && hasMeta);

  return (
    <AppDialog open={!!profile} onClose={closeAll} size="xl">
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
              {view.city ? <p className="mt-1 text-sm text-muted-foreground">{view.city}</p> : null}
            </div>
          </div>
        ) : null}
      </AppDialogHeader>
      <AppDialogBody>
        {view ? (
          <div className={split ? 'grid min-w-0 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(13rem,18rem)] md:items-start md:gap-10' : 'min-w-0'}>
            {view.headline || view.summary ? (
              <div className="min-w-0">
                {view.headline ? (
                  <p className="text-xl font-semibold leading-snug tracking-tight text-foreground">{view.headline}</p>
                ) : null}
                {view.summary ? (
                  <p className={`text-base leading-relaxed text-muted-foreground ${view.headline ? 'mt-4' : ''}`}>
                    {view.summary}
                  </p>
                ) : null}
              </div>
            ) : null}
            {hasMeta ? (
              <aside className={split ? 'min-w-0 space-y-5 md:border-l md:border-border md:pl-8' : 'min-w-0 space-y-5'}>
                {view.languages.length > 0 ? (
                  <AppPersonFieldGroup
                    label={view.languagesHeading || copy.languages}
                    values={view.languages.map((item) => item.label)}
                  />
                ) : null}
                {view.availability ? (
                  <AppPersonFieldGroup
                    label={view.availabilityHeading || copy.availability}
                    values={[view.availability]}
                  />
                ) : null}
                {view.facts.map((item) => (
                  <AppPersonFieldGroup key={item.name} label={item.label} values={item.values} />
                ))}
                {view.links.length > 0 ? (
                  <ul className="flex flex-col gap-2 text-sm">
                    {view.links.map((item) => (
                      <li key={item.key} className="min-w-0">
                        <a href={item.href} className="break-all underline" rel="noreferrer" target="_blank">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </aside>
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
              <Button
                type="submit"
                form="person-inspect-contact"
                className="min-h-11"
                disabled={sending}
                aria-busy={sending}
              >
                {sending ? copy.sending : copy.send}
              </Button>
            }
          >
            <form id="person-inspect-contact" onSubmit={handleSendMessage} className="grid gap-3" aria-busy={sending}>
              {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
              <div className="grid gap-3">
                <Label htmlFor="contact-name">{copy.name}</Label>
                <Input
                  id="contact-name"
                  className="min-h-11"
                  required
                  autoComplete="name"
                  value={senderName}
                  disabled={sending}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="contact-email">{copy.email}</Label>
                <Input
                  id="contact-email"
                  className="min-h-11"
                  type="email"
                  required
                  autoComplete="email"
                  value={senderEmail}
                  disabled={sending}
                  onChange={(e) => setSenderEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="contact-phone">{copy.phone}</Label>
                <Input
                  id="contact-phone"
                  className="min-h-11"
                  type="tel"
                  autoComplete="tel"
                  value={senderPhone}
                  disabled={sending}
                  onChange={(e) => setSenderPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="contact-message">{copy.message}</Label>
                <Textarea
                  id="contact-message"
                  className="min-h-32"
                  required
                  minLength={CONTACT_MESSAGE_MIN}
                  rows={4}
                  value={message}
                  disabled={sending}
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
