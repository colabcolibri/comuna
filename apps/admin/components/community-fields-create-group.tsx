'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from '@community/ui';
import type { CatalogCopy } from './community-fields-types';

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
    toast.success(copy.saved);
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
            <Select value={columns} onValueChange={setColumns}>
              <SelectTrigger id="ops-group-columns">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{copy.columns1}</SelectItem>
                <SelectItem value="2">{copy.columns2}</SelectItem>
                <SelectItem value="3">{copy.columns3}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{copy.columnsHelp}</p>
          </div>
          <div className="flex min-w-0 flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {copy.createGroup}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {copy.cancel}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
