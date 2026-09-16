'use client';

import { DEMO_OPS_LOGIN_EMAIL } from '@community/auth/demo-login-constants';
import { contentFromCatalog, pickContent } from '@community/identity';
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, ThemeToggle } from '@community/ui';
import { useState } from 'react';
import { LocaleSwitcher } from './locale-switcher';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'demo.login.title',
  enter: 'demo.login.enter',
  network: 'otp.network',
  error: 'demo.login.error',
  toDark: 'theme.to_dark',
  toLight: 'theme.to_light',
});

export function DemoOpsLogin() {
  const copy = pickContent(CONTENT, useLocale());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: DEMO_OPS_LOGIN_EMAIL }),
      });
      if (!res.ok) {
        await res.json().catch(() => null);
        setError(copy.error);
        return;
      }
      window.location.assign('/communities');
    } catch {
      setError(copy.network);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-14 items-center justify-end gap-2 border-b border-border bg-card px-4">
        <LocaleSwitcher />
        <ThemeToggle className="size-8" toDark={copy.toDark} toLight={copy.toLight} />
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm min-w-0 overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{copy.title}</CardTitle>
            <p className="font-mono text-sm text-muted-foreground break-all">{DEMO_OPS_LOGIN_EMAIL}</p>
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
      </div>
    </main>
  );
}
