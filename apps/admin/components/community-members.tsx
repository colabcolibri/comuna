'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Label, toast } from '@community/ui';
import { OpsCombobox, OpsSection, OpsTable } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.members',
  help: 'community.members_help',
  empty: 'community.members_empty',
  colEmail: 'community.col_email',
  colRole: 'community.col_role',
  colStatus: 'community.col_status',
  colAction: 'community.col_action',
  roleMember: 'community.role_member',
  roleCoordinator: 'community.role_coordinator',
  makeMember: 'community.make_member',
  promote: 'community.promote',
  statusPending: 'community.status_pending_approval',
  statusActive: 'community.status_active',
  statusSuspended: 'community.status_suspended',
  addSubmit: 'community.members_add_submit',
  added: 'community.members_added',
  duplicate: 'community.members_duplicate',
  asCoordinator: 'community.members_as_coordinator',
  person: 'community.members_person',
  searchPlaceholder: 'community.members_search_placeholder',
  searchHint: 'community.members_search_hint',
  searchEmpty: 'community.members_search_empty',
  error: 'community.save_error',
});

type Membership = {
  id: string;
  email: string;
  network_role: string;
  network_status: string;
};

type Person = { id: string; email: string; full_name: string };

export function CommunityMembers({ communityId }: { communityId: string }) {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Membership[]>([]);
  const [hits, setHits] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [asCoordinator, setAsCoordinator] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadMembers = () => {
    fetch(`/api/admin/communities/${communityId}/memberships`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  };

  useEffect(() => {
    loadMembers();
  }, [communityId]);

  useEffect(() => {
    const needle = query.trim();
    if (needle.length < 2) {
      setHits([]);
      return;
    }
    const ac = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/admin/communities/${communityId}/people?q=${encodeURIComponent(needle)}`, { signal: ac.signal }).then(
        async (res) => {
          if (!res.ok) {
            return;
          }
          const json = await res.json();
          setHits(json.data || []);
        }
      );
    }, 250);
    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [communityId, query]);

  const setRole = async (id: string, network_role: 'member' | 'coordinator') => {
    setSaving(id);
    await fetch(`/api/admin/memberships/${id}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network_role }),
    });
    setSaving(null);
    loadMembers();
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/memberships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        network_role: asCoordinator ? 'coordinator' : 'member',
      }),
    });
    setBusy(false);
    if (res.status === 409) {
      toast.error(copy.duplicate);
      return;
    }
    if (res.status === 400) {
      toast.error(copy.error);
      return;
    }
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    setAsCoordinator(false);
    setUserId('');
    setQuery('');
    setHits([]);
    toast.success(copy.added);
    loadMembers();
  };

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
    <OpsSection title={copy.title} description={copy.help}>
      <form onSubmit={add} className="mb-8 grid max-w-lg gap-4">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="ops-member-person">{copy.person}</Label>
          <OpsCombobox
            id="ops-member-person"
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              setUserId('');
            }}
            options={hits.map((person) => ({
              id: person.id,
              label: person.full_name,
              detail: person.email,
            }))}
            selectedId={userId}
            onSelect={(option) => {
              setUserId(option.id);
              setQuery(option.detail ? `${option.label} (${option.detail})` : option.label);
            }}
            placeholder={copy.searchPlaceholder}
            empty={copy.searchEmpty}
            hint={copy.searchHint}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={asCoordinator} onChange={(ev) => setAsCoordinator(ev.target.checked)} />
          {copy.asCoordinator}
        </label>
        <Button type="submit" disabled={busy || !userId}>
          {copy.addSubmit}
        </Button>
      </form>
      <OpsTable
        columns={[
          {
            id: 'email',
            header: copy.colEmail,
            className: 'break-all',
            cell: (row) => row.email,
          },
          {
            id: 'role',
            header: copy.colRole,
            cell: (row) => (row.network_role === 'coordinator' ? copy.roleCoordinator : copy.roleMember),
          },
          {
            id: 'status',
            header: copy.colStatus,
            cell: (row) => statusLabel(row.network_status),
          },
          {
            id: 'action',
            header: copy.colAction,
            cell: (row) =>
              row.network_role === 'coordinator' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={saving === row.id}
                  onClick={() => void setRole(row.id, 'member')}
                >
                  {copy.makeMember}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={saving === row.id}
                  onClick={() => void setRole(row.id, 'coordinator')}
                >
                  {copy.promote}
                </Button>
              ),
          },
        ]}
        rows={rows}
        empty={copy.empty}
        rowKey={(row) => row.id}
      />
    </OpsSection>
  );
}
