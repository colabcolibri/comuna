'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  modules: 'community.modules',
  coordinator: 'community.coordinator',
  email: 'community.email',
  lookup: 'community.lookup',
  promote: 'community.promote',
  notMember: 'community.not_member',
  back: 'community.back',
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
    await fetch(`/api/admin/communities/${communityId}/modules/${moduleSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
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
    <div className="space-y-8 max-w-3xl min-w-0">
      <Link href="/communities" className="text-sm underline min-h-11 inline-flex items-center">
        {copy.back}
      </Link>
      <div>
        <h1 className="text-xl font-semibold break-words">{name}</h1>
        <p className="font-mono text-sm text-muted-foreground break-all">{slug}</p>
      </div>
      <section className="space-y-3">
        <h2 className="text-base font-medium">{copy.modules}</h2>
        <ul className="space-y-2">
          {modules.map((mod) => (
            <li key={mod.slug} className="flex items-center gap-3 min-h-11">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={mod.enabled}
                  onChange={(ev) => {
                    void toggle(mod.slug, ev.target.checked);
                  }}
                />
                <span className="font-mono">{mod.slug}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-medium">{copy.coordinator}</h2>
        <form onSubmit={lookup} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 space-y-1 min-w-0">
            <Label htmlFor="member-email">{copy.email}</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="min-h-11 w-full sm:w-auto">
              {copy.lookup}
            </Button>
          </div>
        </form>
        {lookupError ? <p className="text-sm text-destructive">{lookupError}</p> : null}
        {found ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span className="break-all">
              {found.email} · {found.network_role}
            </span>
            {found.network_role !== 'coordinator' ? (
              <Button type="button" className="min-h-11" onClick={() => void promote()}>
                {copy.promote}
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
