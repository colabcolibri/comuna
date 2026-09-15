'use client';

import { DEMO_MEMBER_LOGIN_EMAIL } from '@community/auth/demo-login-constants';
import { contentFromCatalog, pickContent } from '@community/identity';
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle } from '@community/ui';
import { useState } from 'react';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  title: 'demo.login.title',
  enter: 'demo.login.enter',
  network: 'otp.network',
  error: 'demo.login.error',
});

export function DemoMemberLogin() {
  const copy = pickContent(CONTENT, useLocale());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: DEMO_MEMBER_LOGIN_EMAIL }),
      });
      if (!res.ok) {
        await res.json().catch(() => null);
        setError(copy.error);
        return;
      }
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next && next.startsWith('/c/') ? next : '/';
    } catch {
      setError(copy.network);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{copy.title}</CardTitle>
        <p className="font-mono text-sm text-muted-foreground break-all">{DEMO_MEMBER_LOGIN_EMAIL}</p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="button" className="h-11 w-full" disabled={loading} onClick={() => void signIn()}>
          {loading ? '…' : copy.enter}
        </Button>
      </CardContent>
    </Card>
  );
}
