'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogHeader, AppSheet, personInitials } from '@community/ui-member';
import { Button, DialogTitle, Input, Label, Textarea, toast } from '@community/ui';
import { pickLocalizedText } from '@community/identity';
import { displayPlaceLocality } from '@community/places';
import { profileChips } from '@/lib/people/chips';
import { sendPersonContact } from '@/lib/api/contact';
import type { PersonCard } from '@/lib/people/person-card';

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

export function PersonInspect({
  profile,
  copy,
  locale,
  canContact,
  onClose,
}: {
  profile: PersonCard | null;
  copy: Record<string, string>;
  locale: string;
  canContact: boolean;
  onClose: () => void;
}) {
  const wide = useWideScreen();
  const [composing, setComposing] = useState(false);
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [fieldError, setFieldError] = useState('');

  const closeAll = () => {
    setComposing(false);
    setSenderEmail('');
    setMessage('');
    setFieldError('');
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
    closeAll();
  };

  const headline = profile ? pickLocalizedText(profile.headline, locale) : '';
  const bio = profile ? pickLocalizedText(profile.bio, locale) : '';
  const chips = profile ? profileChips(profile, copy, locale) : [];
  const city = profile ? displayPlaceLocality(profile.current_city, locale) : '';

  return (
    <>
      <AppDialog open={!!profile} onClose={closeAll} size="lg">
        <AppDialogHeader>
          {profile ? (
            <div className="flex min-w-0 items-start gap-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="size-14 shrink-0 rounded-full object-cover" />
              ) : (
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
                  aria-hidden
                >
                  {personInitials(profile.full_name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <DialogTitle className="tracking-tight text-foreground">{profile.full_name}</DialogTitle>
                {city ? <p className="mt-1 text-base text-muted-foreground">{city}</p> : null}
              </div>
            </div>
          ) : null}
        </AppDialogHeader>
        <AppDialogBody>
          {profile ? (
            <div className="space-y-6">
              {headline ? <p className="text-base font-medium text-foreground">{headline}</p> : null}
              {bio ? <p className="text-base leading-relaxed text-foreground">{bio}</p> : null}
              <ul className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li key={chip} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-sm">
                    {chip}
                  </li>
                ))}
                {profile.custom_attributes.host_at_home ? (
                  <li className="rounded-md border border-border bg-secondary px-2.5 py-1 text-sm">{copy.host}</li>
                ) : null}
              </ul>
              <ul className="flex flex-col gap-2 text-sm">
                {Object.entries(profile.contacts).map(([key, href]) => (
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
          <Button variant="outline" className="min-h-11" type="button" onClick={closeAll}>
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
        open={composing && !!profile}
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
            <Button type="submit" form="person-inspect-contact" className="min-h-11">
              {copy.send}
            </Button>
          </>
        }
      >
        <form id="person-inspect-contact" onSubmit={handleSendMessage} className="space-y-4">
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
    </>
  );
}
