'use client';

import { useUiBind } from '@/lang/use-ui';
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

export default function OtpCard() {
  const t = useUiBind('core_web');
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
        throw new Error(data.error?.message || t('otp.invalid'));
      }
      setStep('code');
      setCode('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('otp.invalid'));
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
        throw new Error(data.error?.message || t('otp.invalid'));
      }
      setDone({ email: data.user.email, role: data.user.global_role });
      window.location.href = '/directory';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('otp.invalid'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Card className="w-full min-w-0">
        <CardHeader>
          <CardTitle>{t('otp.signed_in')}</CardTitle>
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
        <CardTitle className="text-xl">{t('otp.title')}</CardTitle>
        <CardDescription className="text-pretty">{t('otp.subtitle')}</CardDescription>
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
              <Label htmlFor="otp-email">{t('otp.email_label')}</Label>
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
              {loading ? t('otp.sending') : t('otp.send')}
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
                <p className="text-xs text-muted-foreground">{t('otp.email_label')}</p>
                <p className="truncate text-sm font-medium">{email}</p>
              </div>
              <Button type="button" variant="link" className="h-auto shrink-0 px-0" onClick={() => setStep('email')}>
                {t('otp.change')}
              </Button>
            </div>
            <div className="grid min-w-0 gap-3">
              <Label htmlFor="otp-code" className="justify-center text-center">
                {t('otp.code_legend')}
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
              {loading ? t('otp.verifying') : t('otp.verify')}
            </Button>
            <div className="grid gap-2 border-t pt-4 text-center">
              <Button type="button" variant="link" className="h-auto" onClick={() => void requestCode()}>
                {t('otp.resend')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('otp.spam')}</p>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="border-t">
        <p className="text-xs text-muted-foreground">{t('otp.privacy')}</p>
      </CardFooter>
    </Card>
  );
}
