'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogHeader, AppPersonFieldGroup, AppSheet, personInitials } from '@community/ui-member';
import { Button, DialogTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, toast } from '@community/ui';
import { CONTACT_MESSAGE_MIN, parseContactPayload } from '@community/contact-mediated';
import { projectPersonView, type ListField } from '@community/directory';
import { contentFromCatalog, interpolate, pickContent, resolveUiLocale } from '@community/identity';
import { displayPlaceLocality } from '@community/places';
import type { InspectTabItem } from '@/components/app/inspect-sections';
import { uiCatalog } from '@/lang/catalog';
import { sendPersonContact } from '@/lib/api/contact';
import type { PersonCard } from '@/lib/people/person-card';

const INSPECT_CONTENT = contentFromCatalog(uiCatalog, 'core_identity', {
  tabOverview: 'inspect.tab_overview',
  tabCommunity: 'inspect.tab_community',
  linksHeading: 'inspect.links',
});

export function PersonInspect({
  profile,
  listFields,
  copy,
  locale,
  canContact,
  sections,
  tabs: pluginTabs = [],
  onClose,
}: {
  profile: PersonCard | null;
  listFields: ListField[];
  copy: Record<string, string>;
  locale: string;
  canContact: boolean;
  sections?: ReactNode;
  tabs?: InspectTabItem[];
  onClose: () => void;
}) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [message, setMessage] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const inspectCopy = pickContent(INSPECT_CONTENT, resolveUiLocale(locale));

  const view = profile
    ? projectPersonView({
        profile,
        fields: listFields,
        density: 'detail',
        locale,
        cityLabel: displayPlaceLocality(profile.current_city, resolveUiLocale(locale)),
      })
    : null;

  const hasOverviewDetails = Boolean(view && (view.languages.length > 0 || view.links.length > 0));
  const hasCommunityFacts = Boolean(view && view.facts.length > 0);

  const builtTabs: InspectTabItem[] = [];
  if (view && hasOverviewDetails) {
    builtTabs.push({
      id: 'overview',
      label: inspectCopy.tabOverview,
      content: (
        <aside className="grid min-w-0 gap-6 sm:grid-cols-2">
          {view.languages.length > 0 ? (
            <AppPersonFieldGroup
              label={view.languagesHeading || copy.languages}
              values={view.languages.map((item) => item.label)}
            />
          ) : null}
          {view.links.length > 0 ? (
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {inspectCopy.linksHeading}
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                {view.links.map((item) => (
                  <li key={item.key} className="min-w-0">
                    <a href={item.href} className="break-all underline" rel="noreferrer" target="_blank">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      ),
    });
  }
  if (view && hasCommunityFacts) {
    builtTabs.push({
      id: 'community',
      label: inspectCopy.tabCommunity,
      content: (
        <div className="grid min-w-0 gap-6 sm:grid-cols-2">
          {view.facts.map((item) => (
            <AppPersonFieldGroup key={item.name} label={item.label} values={item.values} />
          ))}
        </div>
      ),
    });
  }
  for (const tab of pluginTabs) {
    builtTabs.push(tab);
  }

  const firstTabId = builtTabs[0]?.id ?? '';

  useEffect(() => {
    setActiveTab(firstTabId);
  }, [profile?.id, firstTabId]);

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
    if (parsed.ok === false) {
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

  const messageLen = message.trim().length;
  const messageCountLabel = interpolate(copy.messageCount || '{count}/{min}', {
    count: String(messageLen),
    min: String(CONTACT_MESSAGE_MIN),
  });
  const currentTab = builtTabs.some((t) => t.id === activeTab) ? activeTab : firstTabId;

  return (
    <AppDialog open={!!profile} onClose={closeAll} size="full">
      <Tabs value={currentTab} onValueChange={setActiveTab} className="contents">
        <AppDialogHeader>
          {profile && view ? (
            <div className="space-y-4">
              <div className="flex min-w-0 items-start gap-4">
                {view.photoUrl ? (
                  <img src={view.photoUrl} alt="" className="size-16 shrink-0 rounded-full object-cover sm:size-20" />
                ) : (
                  <div
                    className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-base font-medium text-primary-foreground sm:size-20 sm:text-lg"
                    aria-hidden
                  >
                    {personInitials(view.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl tracking-tight text-foreground sm:text-2xl">{view.name}</DialogTitle>
                  {view.city ? <p className="mt-1 text-sm text-muted-foreground">{view.city}</p> : null}
                </div>
              </div>
              {builtTabs.length > 0 ? (
                <div className="-mb-4 overflow-x-auto">
                  <TabsList variant="line" className="h-auto w-max min-w-full justify-start gap-4 pb-1">
                    {builtTabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id} className="flex-none px-1 py-2 text-sm">
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              ) : null}
            </div>
          ) : null}
        </AppDialogHeader>
        <AppDialogBody>
          {view ? (
            <div className="mx-auto max-w-5xl space-y-8 py-2">
              {view.headline || view.summary ? (
                <div className="min-w-0 border-b border-border pb-6">
                  {view.headline ? (
                    <p className="text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                      {view.headline}
                    </p>
                  ) : null}
                  {view.summary ? (
                    <p className={`max-w-prose text-base leading-relaxed text-muted-foreground ${view.headline ? 'mt-3' : ''}`}>
                      {view.summary}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {builtTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  {tab.content}
                </TabsContent>
              ))}
              {sections}
            </div>
          ) : null}
        </AppDialogBody>
      </Tabs>
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
            description={interpolate(copy.sendTo, { name: view?.name || profile.full_name })}
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
                  rows={4}
                  value={message}
                  disabled={sending}
                  aria-describedby="contact-message-count"
                  aria-invalid={fieldError === copy.messageMin || undefined}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldError === copy.messageMin) setFieldError('');
                  }}
                />
                <p id="contact-message-count" className="text-sm text-muted-foreground tabular-nums">
                  {messageCountLabel}
                </p>
              </div>
            </form>
          </AppSheet>
        ) : null}
      </AppDialogFooter>
    </AppDialog>
  );
}
