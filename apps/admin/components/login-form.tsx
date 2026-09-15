'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'otp.title',
  subtitle: 'otp.subtitle',
  emailLabel: 'otp.email_label',
  send: 'otp.send',
  sending: 'otp.sending',
  codeLabel: 'otp.code_label',
  verify: 'otp.verify',
  forbidden: 'otp.forbidden',
  error: 'otp.error',
});

export function LoginForm() {
  const copy = pickContent(CONTENT, useLocale());
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const request = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/admin/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage(copy.error);
      return;
    }
    setSent(true);
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const res = await fetch('/api/admin/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    setBusy(false);
    if (res.status === 403) {
      setMessage(copy.forbidden);
      return;
    }
    if (!res.ok) {
      setMessage(copy.error);
      return;
    }
    router.push('/communities');
    router.refresh();
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">{copy.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{copy.subtitle}</p>
        </div>
        <form onSubmit={sent ? verify : request} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="ops-email">{copy.emailLabel}</Label>
            <Input
              id="ops-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
            />
          </div>
          {sent ? (
            <div className="space-y-1">
              <Label htmlFor="ops-code">{copy.codeLabel}</Label>
              <Input
                id="ops-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(ev) => setCode(ev.target.value)}
                required
              />
            </div>
          ) : null}
          {message ? <p className="text-sm text-destructive">{message}</p> : null}
          <Button type="submit" className="w-full min-h-11" disabled={busy}>
            {busy ? copy.sending : sent ? copy.verify : copy.send}
          </Button>
        </form>
      </div>
    </main>
  );
}
