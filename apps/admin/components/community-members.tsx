'use client';

import { useEffect, useState } from 'react';
import { Button } from '@community/ui';
import { OpsSection, OpsTable } from '@community/ui-admin';
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
});

type Membership = {
  id: string;
  email: string;
  network_role: string;
  network_status: string;
};

export function CommunityMembers({ communityId }: { communityId: string }) {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Membership[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/admin/communities/${communityId}/memberships`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  };

  useEffect(() => {
    load();
  }, [communityId]);

  const setRole = async (id: string, network_role: 'member' | 'coordinator') => {
    setSaving(id);
    await fetch(`/api/admin/memberships/${id}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network_role }),
    });
    setSaving(null);
    load();
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
