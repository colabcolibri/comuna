'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  modules: 'community.modules',
  modulesHelp: 'community.modules_help',
  on: 'community.on',
  off: 'community.off',
  coordinator: 'community.coordinator',
  coordinatorHelp: 'community.coordinator_help',
  email: 'community.email',
  lookup: 'community.lookup',
  promote: 'community.promote',
  notMember: 'community.not_member',
  back: 'community.back',
  roleCoordinator: 'community.role_coordinator',
});

type ModuleState = { slug: string; enabled: boolean };
type Membership = { id: string; email: string; network_role: string };

export function CommunityDetail({
  communityId,
  name,
  slug,
}: {
  communityId: string;
  name: string;
  slug: string;
}) {
  const copy = pickContent(CONTENT, useLocale());
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [email, setEmail] = useState('');
  const [found, setFound] = useState<Membership | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const loadModules = () => {
    fetch(`/api/admin/communities/${communityId}/modules`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setModules(json.data || []);
    });
  };

  useEffect(() => {
    loadModules();
  }, [communityId]);

  const toggle = async (moduleSlug: string, enabled: boolean) => {
    setSaving(moduleSlug);
    await fetch(`/api/admin/communities/${communityId}/modules/${moduleSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    setSaving(null);
    loadModules();
  };

  const lookup = async (e: FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setFound(null);
    const res = await fetch(
      `/api/admin/communities/${communityId}/memberships?email=${encodeURIComponent(email)}`
    );
    if (res.status === 404) {
      setLookupError(copy.notMember);
      return;
    }
    if (!res.ok) {
      return;
    }
    setFound(await res.json());
  };

  const promote = async () => {
    if (!found) {
      return;
    }
    const res = await fetch(`/api/admin/memberships/${found.id}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network_role: 'coordinator' }),
    });
    if (res.ok) {
      setFound(await res.json());
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6">
      <header className="space-y-1">
        <Link href="/communities" className="inline-block text-sm leading-none text-muted-foreground hover:text-foreground">
          {copy.back}
        </Link>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight break-words">{name}</h1>
        <p className="font-mono text-sm leading-none text-muted-foreground break-all">{slug}</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="font-semibold leading-tight">{copy.modules}</h2>
            <p className="text-sm leading-snug text-muted-foreground">{copy.modulesHelp}</p>
          </div>
          <ul className="divide-y divide-border">
            {modules.map((mod) => (
              <li key={mod.slug} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="font-mono text-sm leading-none">{mod.slug}</span>
                <Button
                  type="button"
                  size="sm"
                  variant={mod.enabled ? 'default' : 'secondary'}
                  disabled={saving === mod.slug}
                  onClick={() => void toggle(mod.slug, !mod.enabled)}
                >
                  {mod.enabled ? copy.on : copy.off}
                </Button>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit space-y-4">
          <div className="space-y-1">
            <h2 className="font-semibold leading-tight">{copy.coordinator}</h2>
            <p className="text-sm leading-snug text-muted-foreground">{copy.coordinatorHelp}</p>
          </div>
          <form onSubmit={lookup} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="member-email">{copy.email}</Label>
              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="outline">
              {copy.lookup}
            </Button>
          </form>
          {lookupError ? <p className="text-sm text-destructive">{lookupError}</p> : null}
          {found ? (
            <div className="space-y-2 text-sm">
              <p className="break-all">
                {found.email}
                {found.network_role === 'coordinator' ? ` · ${copy.roleCoordinator}` : ''}
              </p>
              {found.network_role !== 'coordinator' ? (
                <Button type="button" onClick={() => void promote()}>
                  {copy.promote}
                </Button>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
