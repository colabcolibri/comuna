'use client';

import { contentFromCatalog, pickContent } from '@community/identity';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
} from '@community/ui';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
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
  privacy: 'otp.privacy',
  invalid: 'otp.invalid',
  signedIn: 'otp.signed_in',
});

export default function OtpCard() {
  const copy = pickContent(CONTENT, useLocale());
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ email: string; role: string } | null>(null);

  const requestCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || copy.invalid);
      }
      setStep('code');
      setCode('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : copy.invalid);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (value: string) => {
    if (value.length !== 6 || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || copy.invalid);
      }
      setDone({ email: data.user.email, role: data.user.global_role });
      window.location.href = '/';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : copy.invalid);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Card className="w-full min-w-0">
        <CardHeader>
          <CardTitle>{copy.signedIn}</CardTitle>
          <CardDescription>{done.email}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="text-center">
        <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-xl border bg-secondary text-primary">
          <Mail className="size-5" aria-hidden />
        </div>
        <CardTitle className="text-xl">{copy.title}</CardTitle>
        <CardDescription className="text-pretty">{copy.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'email' ? (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void requestCode();
            }}
          >
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="otp-email">{copy.emailLabel}</Label>
              <Input
                id="otp-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? copy.sending : copy.send}
            </Button>
          </form>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void verify(code);
            }}
          >
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-secondary px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{copy.emailLabel}</p>
                <p className="truncate text-sm font-medium">{email}</p>
              </div>
              <Button type="button" variant="link" className="h-auto shrink-0 px-0" onClick={() => setStep('email')}>
                {copy.change}
              </Button>
            </div>
            <div className="grid min-w-0 gap-3">
              <Label htmlFor="otp-code" className="justify-center text-center">
                {copy.codeLegend}
              </Label>
              <InputOTP
                id="otp-code"
                maxLength={6}
                value={code}
                onChange={setCode}
                onComplete={(value) => void verify(value)}
                disabled={loading}
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
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="h-11 w-full" disabled={loading || code.length !== 6}>
              {loading ? copy.verifying : copy.verify}
            </Button>
            <div className="grid gap-2 border-t pt-4 text-center">
              <Button type="button" variant="link" className="h-auto" onClick={() => void requestCode()}>
                {copy.resend}
              </Button>
              <p className="text-xs text-muted-foreground">{copy.spam}</p>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="border-t">
        <p className="text-xs text-muted-foreground">{copy.privacy}</p>
      </CardFooter>
    </Card>
  );
}
