'use client';

import React, { useEffect, useState } from 'react';
import { Copy, MailPlus, Trash2 } from 'lucide-react';
import { contentFromCatalog, pickContent } from '@community/identity';
import { Button, Card, CardContent, Input, toast } from '@community/ui';
import { AppPageTemplate } from '@community/ui-member';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_membership', {
  kicker: 'coord.kicker',
  title: 'coord.title',
  subtitle: 'coord.subtitle',
  empty: 'coord.empty',
  forbidden: 'coord.forbidden',
  approve: 'coord.approve',
  reject: 'coord.reject',
  notice: 'coord.notice',
});

type Row = { id: string; full_name: string; network_status: string };
type InviteRow = {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export default function CoordApprovalsPage() {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Row[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLocale, setInviteLocale] = useState<'pt-BR' | 'en'>('pt-BR');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const load = () => {
    fetch('/api/coord/approvals').then(async (res) => {
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const json = await res.json();
      setRows(json.pending || []);
    });
    fetch('/api/coord/invitations').then(async (res) => {
      if (!res.ok) return;
      const json = await res.json();
      setInvites(json.invitations || []);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      const res = await fetch('/api/coord/invitations', {
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
      setSendingInvite(false);
    }
  };

  const revokeInvite = async (id: string) => {
    await fetch(`/api/coord/invitations?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    load();
  };

  const act = async (membershipId: string, action: 'approve' | 'reject') => {
    await fetch('/api/coord/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipId, action }),
    });
    load();
  };

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      {copy.notice ? (
        <aside className="mb-6 rounded-lg bg-background border border-border p-4 text-sm text-muted-foreground">{copy.notice}</aside>
      ) : null}
      {forbidden && <p>{copy.forbidden}</p>}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {!forbidden && rows.length === 0 && <p className="p-6 text-muted-foreground">{copy.empty}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border">
                  <td className="px-4 py-4 font-medium">{row.full_name}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        className="min-h-11 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
                        onClick={() => act(row.id, 'approve')}
                      >
                        {copy.approve}
                      </button>
                      <button
                        className="min-h-11 px-4 border border-border rounded-lg text-sm text-destructive bg-destructive-tint"
                        onClick={() => act(row.id, 'reject')}
                      >
                        {copy.reject}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!forbidden ? (
        <Card className="mt-8">
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">Convidar por e-mail / Link</h2>
              <p className="text-sm text-muted-foreground">
                Gere um link de convite (válido por 14 dias) e envie por e-mail para novas pessoas entrarem direto na comunidade.
              </p>
            </div>
            <form onSubmit={sendInvite} className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                required
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <select
                aria-label="Idioma do e-mail"
                value={inviteLocale}
                onChange={(e) => setInviteLocale(e.target.value === 'en' ? 'en' : 'pt-BR')}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="pt-BR">Português (PT-BR)</option>
                <option value="en">English (EN)</option>
              </select>
              <Button type="submit" disabled={sendingInvite}>
                <MailPlus className="size-4" />
                {sendingInvite ? 'Enviando…' : 'Gerar e enviar convite'}
              </Button>
            </form>

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
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Remover convite"
                          onClick={() => void revokeInvite(inv.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </AppPageTemplate>
  );
}
