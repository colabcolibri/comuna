'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Copy, MailPlus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, Input, toast } from '@community/ui';

export type InviteItem = {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export function InvitationsPanel({
  endpoint,
  showQuota = true,
}: {
  endpoint: '/api/invitations' | '/api/coord/invitations';
  showQuota?: boolean;
}) {
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [limit, setLimit] = useState<number>(5);
  const [sentCount, setSentCount] = useState<number>(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLocale, setInviteLocale] = useState<'pt-BR' | 'en'>('pt-BR');
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    fetch(endpoint).then(async (res) => {
      if (!res.ok) return;
      const json = await res.json();
      setInvites(json.invitations || []);
      if (typeof json.limit === 'number') setLimit(json.limit);
      if (typeof json.sentCount === 'number') setSentCount(json.sentCount);
    });
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const limitReached = showQuota && sentCount >= limit;

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || limitReached) return;
    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, locale: inviteLocale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error?.message || 'Não foi possível criar o convite.');
        return;
      }
      setInviteEmail('');
      if (data.inviteUrl && navigator.clipboard) {
        await navigator.clipboard.writeText(data.inviteUrl).catch(() => {});
      }
      toast.success(
        data.emailSent
          ? 'Convite enviado por e-mail e link copiado!'
          : 'Link de convite criado e copiado!'
      );
      load();
    } finally {
      setSending(false);
    }
  };

  const revokeInvite = async (id: string) => {
    await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    load();
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Convidar por e-mail / Link</h2>
            <p className="text-sm text-muted-foreground">
              Gere um link de convite (válido por 14 dias) e envie por e-mail para novas pessoas entrarem na comunidade.
            </p>
          </div>
          {showQuota ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium tabular-nums text-foreground">
              {sentCount} / {limit} convites usados
            </span>
          ) : null}
        </div>

        <form onSubmit={sendInvite} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            required
            disabled={limitReached}
            placeholder="email@exemplo.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1"
          />
          <select
            aria-label="Idioma do e-mail"
            value={inviteLocale}
            disabled={limitReached}
            onChange={(e) => setInviteLocale(e.target.value === 'en' ? 'en' : 'pt-BR')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="pt-BR">Português (PT-BR)</option>
            <option value="en">English (EN)</option>
          </select>
          <Button type="submit" disabled={sending || limitReached}>
            <MailPlus className="size-4" />
            {sending ? 'Enviando…' : 'Gerar e enviar convite'}
          </Button>
        </form>

        {limitReached ? (
          <p className="text-xs font-medium text-muted-foreground">
            Você atingiu o limite de {limit} convites desta comunidade.
          </p>
        ) : null}

        {invites.length > 0 ? (
          <ul className="divide-y divide-border rounded-lg border">
            {invites.map((inv) => {
              const expired = !inv.accepted_at && new Date(inv.expires_at).getTime() < Date.now();
              return (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.accepted_at ? 'Aceito' : expired ? 'Expirado' : 'Pendente'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!inv.accepted_at && !expired ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const url = `${window.location.origin}/invite/${inv.token}`;
                          await navigator.clipboard?.writeText(url);
                          toast.success('Link de convite copiado!');
                        }}
                      >
                        <Copy className="size-3.5" />
                        Copiar link
                      </Button>
                    ) : null}
                    {!inv.accepted_at ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Remover convite"
                        onClick={() => void revokeInvite(inv.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
