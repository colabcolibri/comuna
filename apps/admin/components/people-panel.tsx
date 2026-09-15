'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OpsBadge, OpsPageTemplate } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  kicker: 'people.kicker',
  title: 'people.title',
  subtitle: 'people.subtitle',
  empty: 'people.empty',
  none: 'people.none',
  badgeAdmin: 'people.badge_admin',
  badgeAdminHint: 'people.badge_admin_hint',
  roleMember: 'community.role_member',
  roleCoordinator: 'community.role_coordinator',
  statusPending: 'community.status_pending_approval',
  statusActive: 'community.status_active',
  statusSuspended: 'community.status_suspended',
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

  useEffect(() => {
    fetch('/api/admin/people').then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  }, []);

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

  return (
    <OpsPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
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
    </OpsPageTemplate>
  );
}
