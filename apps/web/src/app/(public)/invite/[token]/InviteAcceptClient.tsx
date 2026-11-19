'use client';

import { useState } from 'react';
import { Button, Card, CardContent, toast } from '@community/ui';

export function InviteAcceptClient({
  token,
  communityName,
  email,
  state,
}: {
  token: string;
  communityName: string;
  email: string;
  state: 'valid' | 'used' | 'expired' | 'invalid';
}) {
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invitations/${token}/accept`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error?.message || 'Não foi possível aceitar o convite.');
        return;
      }
      window.location.href = data.redirectTo || '/';
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
      <Card className="w-full">
        <CardContent className="space-y-4 p-6 text-center">
          {state === 'valid' ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Convite</p>
              <h1 className="text-2xl font-semibold tracking-tight">{communityName}</h1>
              <p className="text-sm text-muted-foreground">
                Você recebeu um convite para entrar com o e-mail <strong className="text-foreground">{email}</strong>.
              </p>
              <Button type="button" className="w-full" disabled={loading} onClick={accept}>
                {loading ? 'Entrando…' : 'Aceitar convite e entrar'}
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">
                {state === 'used'
                  ? 'Este convite já foi utilizado'
                  : state === 'expired'
                    ? 'Este convite expirou'
                    : 'Convite inválido'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Peça um novo link de convite para a coordenação da comunidade.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
