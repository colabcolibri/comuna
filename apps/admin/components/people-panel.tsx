'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Label, toast } from '@community/ui';
import { OpsBadge, OpsPageTemplate } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  kicker: 'people.kicker',
  title: 'people.title',
  subtitle: 'people.subtitle',
  empty: 'people.empty',
  search: 'people.search',
  more: 'community.members_more',
  none: 'people.none',
  badgeAdmin: 'people.badge_admin',
  badgeAdminHint: 'people.badge_admin_hint',
  roleMember: 'community.role_member',
  roleCoordinator: 'community.role_coordinator',
  statusPending: 'community.status_pending_approval',
  statusActive: 'community.status_active',
  statusSuspended: 'community.status_suspended',
  create: 'people.create',
  createHelp: 'people.create_help',
  fullName: 'people.full_name',
  email: 'people.email',
  created: 'people.created',
  duplicate: 'people.duplicate',
  error: 'community.save_error',
});

type Seat = {
  community_id: string;
  community_name: string;
  community_slug: string;
  network_role: string;
  network_status: string;
};

type Person = {
  id: string;
  email: string;
  full_name: string;
  global_role: string;
  seats: Seat[];
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

export function PeoplePanel() {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = (offset: number, q: string) => {
    fetch(`/api/admin/people?q=${encodeURIComponent(q)}&offset=${offset}`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      const next = (json.data || []) as Person[];
      setRows((current) => (offset === 0 ? next : [...current, ...next]));
      setHasMore(Boolean(json.meta?.hasMore));
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load(0, query.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const roleLabel = (role: string) => (role === 'coordinator' ? copy.roleCoordinator : copy.roleMember);
  const statusLabel = (status: string) => {
    if (status === 'pending_approval') {
      return copy.statusPending;
    }
    if (status === 'suspended') {
      return copy.statusSuspended;
    }
    return copy.statusActive;
  };

  const createPerson = async () => {
    setCreating(true);
    const res = await fetch('/api/admin/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, full_name: newName }),
    });
    setCreating(false);
    if (res.status === 409) {
      toast.error(copy.duplicate);
      return;
    }
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.created);
    setNewEmail('');
    setNewName('');
    load(0, query.trim());
  };

  return (
    <OpsPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <form
        className="mb-8 grid max-w-lg gap-3"
        onSubmit={(ev) => {
          ev.preventDefault();
          void createPerson();
        }}
      >
        <p className="text-sm text-muted-foreground">{copy.createHelp}</p>
        <div className="space-y-2">
          <Label htmlFor="ops-person-name">{copy.fullName}</Label>
          <Input id="ops-person-name" value={newName} onChange={(ev) => setNewName(ev.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-person-email">{copy.email}</Label>
          <Input id="ops-person-email" type="email" value={newEmail} onChange={(ev) => setNewEmail(ev.target.value)} required />
        </div>
        <Button type="submit" disabled={creating}>
          {copy.create}
        </Button>
      </form>
      <div className="mb-6 max-w-lg">
        <Input value={query} onChange={(ev) => setQuery(ev.target.value)} placeholder={copy.search} />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground"
                  aria-hidden
                >
                  {initials(row.full_name)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium wrap-break-word text-foreground">{row.full_name}</p>
                    {row.global_role === 'super_admin' ? (
                      <OpsBadge title={copy.badgeAdminHint}>{copy.badgeAdmin}</OpsBadge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground wrap-break-word">{row.email}</p>
                </div>
              </div>
              <div className="min-w-0 lg:max-w-[58%]">
                {row.seats.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{copy.none}</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {row.seats.map((seat) => (
                      <li key={`${row.id}-${seat.community_id}`} className="min-w-0">
                        <Link
                          href={`/communities/${seat.community_id}/members`}
                          className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-sm text-foreground hover:bg-secondary/80"
                        >
                          <span className="font-medium wrap-break-word">{seat.community_name}</span>
                          <span className="text-muted-foreground">· {roleLabel(seat.network_role)}</span>
                          <span className="text-muted-foreground">· {statusLabel(seat.network_status)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore ? (
        <Button type="button" variant="outline" className="mt-4" onClick={() => load(rows.length, query.trim())}>
          {copy.more}
        </Button>
      ) : null}
    </OpsPageTemplate>
  );
}
