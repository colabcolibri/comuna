'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Checkbox, Input, Label, toast } from '@community/ui';
import { OpsCombobox, OpsSection, OpsTable } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';
import { CommunityMembershipActions } from './community-membership-actions';

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
  rosterSearch: 'community.members_roster_search',
  more: 'community.members_more',
  approve: 'community.members_approve',
  suspend: 'community.members_suspend',
  reactivate: 'community.members_reactivate',
  remove: 'community.members_remove',
  cohortNone: 'community.cohort_none',
  colCohort: 'community.col_cohort',
  error: 'community.save_error',
});

type Membership = {
  id: string;
  email: string;
  full_name?: string;
  network_role: string;
  network_status: string;
  cohort_id?: string | null;
  cohort_name?: string | null;
};

type Person = { id: string; email: string; full_name: string };
type Cohort = { id: string; name: string };

export function CommunityMembers({ communityId }: { communityId: string }) {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Membership[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [hits, setHits] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [rosterQuery, setRosterQuery] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [asCoordinator, setAsCoordinator] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadMembers = (offset = 0) => {
    const q = rosterQuery.trim();
    fetch(`/api/admin/communities/${communityId}/memberships?q=${encodeURIComponent(q)}&offset=${offset}`).then(
      async (res) => {
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        const next = (json.data || []) as Membership[];
        setRows((current) => (offset === 0 ? next : [...current, ...next]));
        setHasMore(Boolean(json.meta?.hasMore));
      }
    );
    fetch(`/api/admin/communities/${communityId}/cohorts`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setCohorts(json.data || []);
    });
  };

  useEffect(() => {
    loadMembers(0);
  }, [communityId, rosterQuery]);

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
    loadMembers(0);
  };

  const setStatus = async (id: string, network_status: 'pending_approval' | 'active' | 'suspended') => {
    setSaving(id);
    await fetch(`/api/admin/memberships/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network_status }),
    });
    setSaving(null);
    loadMembers(0);
  };

  const setCohort = async (id: string, cohortId: string | null) => {
    setSaving(id);
    await fetch(`/api/admin/memberships/${id}/cohort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId }),
    });
    setSaving(null);
    loadMembers(0);
  };

  const remove = async (id: string) => {
    setSaving(id);
    await fetch(`/api/admin/memberships/${id}`, { method: 'DELETE' });
    setSaving(null);
    loadMembers(0);
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
    loadMembers(0);
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
          <Checkbox checked={asCoordinator} onCheckedChange={(checked) => setAsCoordinator(checked === true)} />
          {copy.asCoordinator}
        </label>
        <Button type="submit" disabled={busy || !userId}>
          {copy.addSubmit}
        </Button>
      </form>
      <div className="mb-4 max-w-lg">
        <Label htmlFor="ops-roster-search">{copy.rosterSearch}</Label>
        <Input
          id="ops-roster-search"
          className="mt-2"
          value={rosterQuery}
          onChange={(ev) => setRosterQuery(ev.target.value)}
          placeholder={copy.searchPlaceholder}
        />
      </div>
      <OpsTable
        columns={[
          {
            id: 'email',
            header: copy.colEmail,
            className: 'break-all',
            cell: (row) => (
              <span>
                {row.full_name ? <span className="block font-medium">{row.full_name}</span> : null}
                {row.email}
              </span>
            ),
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
            id: 'cohort',
            header: copy.colCohort,
            cell: (row) => row.cohort_name || copy.cohortNone,
          },
          {
            id: 'action',
            header: copy.colAction,
            cell: (row) => (
              <CommunityMembershipActions
                row={row}
                saving={saving === row.id}
                cohorts={cohorts}
                copy={copy}
                onRole={(role) => void setRole(row.id, role)}
                onStatus={(status) => void setStatus(row.id, status)}
                onCohort={(cohortId) => void setCohort(row.id, cohortId)}
                onRemove={() => void remove(row.id)}
              />
            ),
          },
        ]}
        rows={rows}
        empty={copy.empty}
        rowKey={(row) => row.id}
      />
      {hasMore ? (
        <Button type="button" variant="outline" className="mt-4" onClick={() => loadMembers(rows.length)}>
          {copy.more}
        </Button>
      ) : null}
    </OpsSection>
  );
}
