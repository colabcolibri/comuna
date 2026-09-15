'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Input, Label, toast } from '@community/ui';
import { OpsSection, OpsTable } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.cohorts',
  help: 'community.cohorts_help',
  empty: 'community.cohorts_empty',
  name: 'community.cohorts_name',
  code: 'community.cohorts_code',
  create: 'community.cohorts_create',
  created: 'community.cohorts_created',
  delete: 'community.fields_delete',
  error: 'community.save_error',
});

type Cohort = { id: string; name: string; code: string | null };

export function CommunityCohorts({ communityId }: { communityId: string }) {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Cohort[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetch(`/api/admin/communities/${communityId}/cohorts`).then(async (res) => {
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

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/cohorts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    setName('');
    setCode('');
    toast.success(copy.created);
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/communities/${communityId}/cohorts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    load();
  };

  return (
    <OpsSection title={copy.title} description={copy.help}>
      <form onSubmit={add} className="mb-8 grid max-w-lg gap-4">
        <div className="space-y-2">
          <Label htmlFor="ops-cohort-name">{copy.name}</Label>
          <Input id="ops-cohort-name" value={name} onChange={(ev) => setName(ev.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-cohort-code">{copy.code}</Label>
          <Input id="ops-cohort-code" value={code} onChange={(ev) => setCode(ev.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>
          {copy.create}
        </Button>
      </form>
      <OpsTable
        columns={[
          { id: 'name', header: copy.name, cell: (row) => row.name },
          { id: 'code', header: copy.code, cell: (row) => row.code || '—' },
          {
            id: 'action',
            header: copy.delete,
            cell: (row) => (
              <Button type="button" size="sm" variant="outline" onClick={() => void remove(row.id)}>
                {copy.delete}
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
