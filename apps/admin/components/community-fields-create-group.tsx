'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Label, toast } from '@community/ui';
import { CATALOG_SELECT_CLASS, type CatalogCopy } from './community-fields-types';

export function CommunityFieldsCreateGroup({
  communityId,
  copy,
  onCreated,
}: {
  communityId: string;
  copy: CatalogCopy;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [labelPt, setLabelPt] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [columns, setColumns] = useState('1');
  const [busy, setBusy] = useState(false);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelPt, labelEn, columns: Number(columns) }),
    });
    setBusy(false);
    if (res.status === 409) {
      toast.error(copy.duplicate);
      return;
    }
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    setLabelPt('');
    setLabelEn('');
    setColumns('1');
    setOpen(false);
    onCreated();
  };

  return (
    <div className="min-w-0">
      <Button type="button" variant="outline" onClick={() => setOpen((value) => !value)}>
        {copy.addGroup}
      </Button>
      {open ? (
        <form onSubmit={create} className="mt-4 grid max-w-lg gap-4">
          <div className="space-y-2">
            <Label htmlFor="ops-group-pt">{copy.labelPt}</Label>
            <Input id="ops-group-pt" value={labelPt} onChange={(ev) => setLabelPt(ev.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-group-en">{copy.labelEn}</Label>
            <Input id="ops-group-en" value={labelEn} onChange={(ev) => setLabelEn(ev.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-group-columns">{copy.columns}</Label>
            <select
              id="ops-group-columns"
              className={CATALOG_SELECT_CLASS}
              value={columns}
              onChange={(ev) => setColumns(ev.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <Button type="submit" disabled={busy}>
            {copy.createGroup}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
