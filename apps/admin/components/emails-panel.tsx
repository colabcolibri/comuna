'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, toast } from '@community/ui';
import { OpsPageTemplate } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  kicker: 'emails.kicker',
  title: 'emails.title',
  subtitle: 'emails.subtitle',
  kind: 'emails.kind',
  locale: 'emails.locale',
  subject: 'emails.subject',
  html: 'emails.html',
  text: 'emails.text',
  preview: 'emails.preview',
  save: 'emails.save',
  reset: 'emails.reset',
  saved: 'emails.saved',
  resetOk: 'emails.reset_ok',
  error: 'community.save_error',
  member: 'emails.kind_member_otp',
  ops: 'emails.kind_ops_otp',
  invite: 'emails.kind_person_invite',
  contact: 'emails.kind_contact_notice',
});

const KINDS = ['member_otp', 'ops_otp', 'person_invite', 'contact_notice'] as const;

export function EmailsPanel() {
  const copy = pickContent(CONTENT, useLocale());
  const [kind, setKind] = useState<(typeof KINDS)[number]>('member_otp');
  const [locale, setLocale] = useState<'pt-BR' | 'en'>('pt-BR');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const kindLabel: Record<(typeof KINDS)[number], string> = {
    member_otp: copy.member,
    ops_otp: copy.ops,
    person_invite: copy.invite,
    contact_notice: copy.contact,
  };

  const load = (nextKind = kind, nextLocale = locale) => {
    fetch(`/api/admin/email-templates?kind=${nextKind}&locale=${nextLocale}`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      const data = json.data;
      setSubject(data.subject);
      setHtmlBody(data.html_body);
      setTextBody(data.text_body);
      setPreviewHtml(data.previewHtml);
    });
  };

  useEffect(() => {
    load(kind, locale);
  }, [kind, locale]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/email-templates/${kind}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, subject, html_body: htmlBody, text_body: textBody }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    load();
  };

  const reset = async () => {
    const res = await fetch(`/api/admin/email-templates/${kind}?locale=${locale}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.resetOk);
    load();
  };

  return (
    <OpsPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <form onSubmit={(ev) => void save(ev)} className="grid gap-6 lg:grid-cols-2">
        <div className="grid min-w-0 gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ops-email-kind">{copy.kind}</Label>
              <Select value={kind} onValueChange={(next) => setKind(next as (typeof KINDS)[number])}>
                <SelectTrigger id="ops-email-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {kindLabel[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ops-email-locale">{copy.locale}</Label>
              <Select value={locale} onValueChange={(next) => setLocale(next === 'en' ? 'en' : 'pt-BR')}>
                <SelectTrigger id="ops-email-locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">pt-BR</SelectItem>
                  <SelectItem value="en">en</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-email-subject">{copy.subject}</Label>
            <Textarea id="ops-email-subject" className="min-h-16" value={subject} onChange={(ev) => setSubject(ev.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-email-html">{copy.html}</Label>
            <Textarea id="ops-email-html" className="min-h-40 font-mono text-sm" value={htmlBody} onChange={(ev) => setHtmlBody(ev.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-email-text">{copy.text}</Label>
            <Textarea id="ops-email-text" className="min-h-24 font-mono text-sm" value={textBody} onChange={(ev) => setTextBody(ev.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">{copy.save}</Button>
            <Button type="button" variant="outline" onClick={() => void reset()}>
              {copy.reset}
            </Button>
          </div>
        </div>
        <div className="min-w-0 space-y-2">
          <Label>{copy.preview}</Label>
          <iframe
            title={copy.preview}
            sandbox=""
            className="h-[32rem] w-full rounded-md border border-border bg-background"
            srcDoc={previewHtml}
          />
        </div>
      </form>
    </OpsPageTemplate>
  );
}
