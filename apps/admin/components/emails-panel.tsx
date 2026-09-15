'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Label, Textarea, toast } from '@community/ui';
import { OpsAlertDialog, OpsPageTemplate, OpsTabs, OpsHtmlPreview } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { composeMail, defaultCopy, KIND_SLOT, KIND_VARIABLES, previewVarsFor, type EmailKind } from '@community/mail/compose';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  kicker: 'emails.kicker',
  title: 'emails.title',
  subtitle: 'emails.subtitle',
  kind: 'emails.kind',
  locale: 'emails.locale',
  subject: 'emails.subject',
  heading: 'emails.heading',
  body: 'emails.body',
  bodyHelp: 'emails.body_help',
  preview: 'emails.preview',
  previewHelp: 'emails.preview_help',
  variables: 'emails.variables',
  variablesHelp: 'emails.variables_help',
  slotVars: 'emails.slot_vars',
  slotOtp: 'emails.slot_otp',
  slotCta: 'emails.slot_cta',
  slotQuote: 'emails.slot_quote',
  envelopeNote: 'emails.envelope_note',
  save: 'emails.save',
  reset: 'emails.reset',
  resetTitle: 'emails.reset_title',
  resetBody: 'emails.reset_body',
  cancel: 'community.fields_cancel',
  saved: 'emails.saved',
  resetOk: 'emails.reset_ok',
  error: 'community.save_error',
  loadError: 'emails.load_error',
  member: 'emails.kind_member_otp',
  ops: 'emails.kind_ops_otp',
  invite: 'emails.kind_person_invite',
  contact: 'emails.kind_contact_notice',
});

const KINDS = ['member_otp', 'ops_otp', 'person_invite', 'contact_notice'] as const;
const FALLBACK_ENVELOPE = {
  product_name: 'Community',
  from_name: 'Community',
  from_address: '',
  support_url: '',
  logo_url: '',
};

type FieldKey = 'subject' | 'heading' | 'body';

function insertAtCursor(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  current: string,
  token: string,
  setValue: (next: string) => void
) {
  if (!el) {
    setValue(`${current}${token}`);
    return;
  }
  const start = el.selectionStart ?? current.length;
  const end = el.selectionEnd ?? start;
  const next = `${current.slice(0, start)}${token}${current.slice(end)}`;
  setValue(next);
  requestAnimationFrame(() => {
    el.focus();
    const pos = start + token.length;
    el.setSelectionRange(pos, pos);
  });
}

function applyCopy(
  kind: EmailKind,
  locale: 'pt-BR' | 'en',
  setSubject: (value: string) => void,
  setHeading: (value: string) => void,
  setBody: (value: string) => void
) {
  const next = defaultCopy(kind, locale);
  setSubject(next.subject);
  setHeading(next.heading);
  setBody(next.body);
}

export function EmailsPanel() {
  const copy = pickContent(CONTENT, useLocale());
  const initial = defaultCopy('member_otp', 'pt-BR');
  const [kind, setKind] = useState<EmailKind>('member_otp');
  const [locale, setLocale] = useState<'pt-BR' | 'en'>('pt-BR');
  const [subject, setSubject] = useState(initial.subject);
  const [heading, setHeading] = useState(initial.heading);
  const [body, setBody] = useState(initial.body);
  const [envelope, setEnvelope] = useState(FALLBACK_ENVELOPE);
  const [lastField, setLastField] = useState<FieldKey>('body');
  const [pendingReset, setPendingReset] = useState(false);
  const subjectRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const kindItems = [
    { value: 'member_otp', label: copy.member },
    { value: 'ops_otp', label: copy.ops },
    { value: 'person_invite', label: copy.invite },
    { value: 'contact_notice', label: copy.contact },
  ];
  const localeItems = [
    { value: 'pt-BR', label: 'pt-BR' },
    { value: 'en', label: 'en' },
  ];
  const slotNote = {
    otp: copy.slotOtp,
    cta: copy.slotCta,
    quote: copy.slotQuote,
  }[KIND_SLOT[kind]];
  const copyVars = KIND_VARIABLES[kind].filter((item) => !item.slot);
  const slotVars = KIND_VARIABLES[kind].filter((item) => item.slot);

  const load = useCallback(
    async (nextKind: EmailKind, nextLocale: 'pt-BR' | 'en') => {
      const res = await fetch(`/api/admin/email-templates?kind=${nextKind}&locale=${nextLocale}`);
      if (!res.ok) {
        toast.error(copy.loadError);
        return;
      }
      const json = await res.json();
      const data = json.data;
      setSubject(data.subject);
      setHeading(data.heading);
      setBody(data.body);
      if (data.envelope) {
        setEnvelope(data.envelope);
      }
    },
    [copy.loadError]
  );

  useEffect(() => {
    void load(kind, locale);
  }, [kind, locale, load]);

  const previewHtml = useMemo(() => {
    try {
      return composeMail({
        kind,
        locale,
        vars: previewVarsFor(kind, envelope),
        settings: envelope,
        overlay: { subject, heading, body },
      }).html;
    } catch {
      return '';
    }
  }, [kind, locale, subject, heading, body, envelope]);

  const insertVariable = (name: string) => {
    const token = `{{${name}}}`;
    if (lastField === 'subject') {
      insertAtCursor(subjectRef.current, subject, token, setSubject);
      return;
    }
    if (lastField === 'heading') {
      insertAtCursor(headingRef.current, heading, token, setHeading);
      return;
    }
    insertAtCursor(bodyRef.current, body, token, setBody);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/email-templates/${kind}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, subject, heading, body }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    await load(kind, locale);
  };

  const reset = async () => {
    const res = await fetch(`/api/admin/email-templates/${kind}?locale=${locale}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.resetOk);
    applyCopy(kind, locale, setSubject, setHeading, setBody);
    await load(kind, locale);
  };

  const changeKind = (next: string) => {
    const value = next as EmailKind;
    setKind(value);
    applyCopy(value, locale, setSubject, setHeading, setBody);
  };

  const changeLocale = (next: string) => {
    const value = next === 'en' ? 'en' : 'pt-BR';
    setLocale(value);
    applyCopy(kind, value, setSubject, setHeading, setBody);
  };

  return (
    <OpsPageTemplate
      kicker={copy.kicker}
      title={copy.title}
      subtitle={copy.subtitle}
      nav={
        <div className="mb-6 min-w-0 space-y-3">
          <OpsTabs ariaLabel={copy.kind} value={kind} onValueChange={changeKind} items={kindItems} />
          <OpsTabs ariaLabel={copy.locale} value={locale} onValueChange={changeLocale} items={localeItems} />
        </div>
      }
    >
      <form onSubmit={(ev) => void save(ev)} className="grid gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 gap-4">
          <p className="text-sm text-muted-foreground">{copy.envelopeNote}</p>
          <p className="text-sm text-muted-foreground">{slotNote}</p>
          {slotVars.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {copy.slotVars} {slotVars.map((item) => `{{${item.name}}}`).join(', ')}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label>{copy.variables}</Label>
            <p className="text-sm text-muted-foreground">{copy.variablesHelp}</p>
            <div className="flex flex-wrap gap-2">
              {copyVars.map((item) => (
                <Button
                  key={item.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="max-w-full font-mono text-xs"
                  title={item.sample}
                  onClick={() => insertVariable(item.name)}
                >
                  {`{{${item.name}}}`}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-email-subject">{copy.subject}</Label>
            <Input
              ref={subjectRef}
              id="ops-email-subject"
              value={subject}
              onFocus={() => setLastField('subject')}
              onChange={(ev) => setSubject(ev.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-email-heading">{copy.heading}</Label>
            <Input
              ref={headingRef}
              id="ops-email-heading"
              value={heading}
              onFocus={() => setLastField('heading')}
              onChange={(ev) => setHeading(ev.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-email-body">{copy.body}</Label>
            <p className="text-sm text-muted-foreground">{copy.bodyHelp}</p>
            <Textarea
              ref={bodyRef}
              id="ops-email-body"
              className="min-h-32 max-h-56 resize-y overflow-auto whitespace-pre-wrap break-words text-sm leading-relaxed"
              value={body}
              onFocus={() => setLastField('body')}
              onChange={(ev) => setBody(ev.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">{copy.save}</Button>
            <Button type="button" variant="outline" onClick={() => setPendingReset(true)}>
              {copy.reset}
            </Button>
          </div>
        </div>
        <div className="min-w-0 space-y-2">
          <Label>{copy.preview}</Label>
          <p className="text-sm text-muted-foreground">{copy.previewHelp}</p>
          <OpsHtmlPreview title={copy.preview} html={previewHtml} />
        </div>
      </form>
      <OpsAlertDialog
        isOpen={pendingReset}
        onClose={() => setPendingReset(false)}
        title={copy.resetTitle}
        description={copy.resetBody}
        cancelLabel={copy.cancel}
        confirmLabel={copy.reset}
        confirmVariant="destructive"
        onConfirm={() => {
          setPendingReset(false);
          void reset();
        }}
      />
    </OpsPageTemplate>
  );
}
