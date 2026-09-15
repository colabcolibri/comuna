'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
  ThemeToggle,
} from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { otpErrorCodeFromBody, otpUserMessage } from '@community/auth/otp-api-error';
import { LocaleSwitcher } from './locale-switcher';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'otp.title',
  subtitle: 'otp.subtitle',
  emailLabel: 'otp.email_label',
  change: 'otp.change',
  send: 'otp.send',
  sending: 'otp.sending',
  codeLegend: 'otp.code_legend',
  verify: 'otp.verify',
  verifying: 'otp.verifying',
  resend: 'otp.resend',
  spam: 'otp.spam',
  invalid: 'otp.invalid',
  rateLimit: 'otp.rate_limit',
  emailInvalid: 'otp.email_invalid',
  mail: 'otp.mail',
  network: 'otp.network',
  requestError: 'otp.request_error',
  verifyError: 'otp.verify_error',
  toDark: 'theme.to_dark',
  toLight: 'theme.to_light',
});

export function LoginForm() {
  const copy = pickContent(CONTENT, useLocale());
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const requestCode = async () => {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(otpUserMessage('request', otpErrorCodeFromBody(data), copy));
        return;
      }
      setStep('code');
      setCode('');
    } catch {
      setMessage(copy.network);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    if (value.length !== 6 || busy) {
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: value }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage(otpUserMessage('verify', otpErrorCodeFromBody(data), copy));
        return;
      }
      router.push('/communities');
      router.refresh();
    } catch {
      setMessage(copy.network);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh bg-background">
      <div className="flex h-14 items-center justify-end gap-2 border-b border-border bg-card px-4">
        <LocaleSwitcher />
        <ThemeToggle className="size-8" toDark={copy.toDark} toLight={copy.toLight} />
      </div>
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form
                className="space-y-4"
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  void requestCode();
                }}
              >
                <div className="space-y-2">
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
                {message ? <p className="text-sm text-destructive">{message}</p> : null}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? copy.sending : copy.send}
                </Button>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  void verify(code);
                }}
              >
                <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-secondary px-3 py-2.5">
                  <p className="min-w-0 truncate text-sm font-medium">{email}</p>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto shrink-0 px-0"
                    onClick={() => {
                      setStep('email');
                      setCode('');
                      setMessage('');
                    }}
                  >
                    {copy.change}
                  </Button>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="ops-code" className="justify-center text-center">
                    {copy.codeLegend}
                  </Label>
                  <InputOTP
                    id="ops-code"
                    maxLength={6}
                    value={code}
                    onChange={setCode}
                    onComplete={(value) => void verify(value)}
                    disabled={busy}
                    containerClassName="w-full min-w-0 justify-center"
                  >
                    <InputOTPGroup className="w-full min-w-0">
                      <InputOTPSlot index={0} className="h-12 flex-1" />
                      <InputOTPSlot index={1} className="h-12 flex-1" />
                      <InputOTPSlot index={2} className="h-12 flex-1" />
                      <InputOTPSlot index={3} className="h-12 flex-1" />
                      <InputOTPSlot index={4} className="h-12 flex-1" />
                      <InputOTPSlot index={5} className="h-12 flex-1" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {message ? <p className="text-sm text-destructive">{message}</p> : null}
                <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
                  {busy ? copy.verifying : copy.verify}
                </Button>
                <div className="grid gap-2 border-t border-border pt-4 text-center">
                  <Button type="button" variant="link" className="h-auto" disabled={busy} onClick={() => void requestCode()}>
                    {copy.resend}
                  </Button>
                  <p className="text-xs text-muted-foreground">{copy.spam}</p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
