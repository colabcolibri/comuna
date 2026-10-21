'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Label, toast } from '@community/ui';
import { OpsDialog, OpsDialogBody, OpsDialogHeader } from '@community/ui-admin';
import type { CatalogCopy } from './community-fields-types';

export function CommunityFieldsCreateGroup({
  communityId,
  locale,
  copy,
  onCreated,
}: {
  communityId: string;
  locale: string | undefined;
  copy: CatalogCopy;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const english = locale === 'en';

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        labelPt: english ? '' : label,
        labelEn: english ? label : '',
        columns: 1,
      }),
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
    setLabel('');
    setOpen(false);
    toast.success(copy.saved);
    onCreated();
  };

  return (
    <div className="min-w-0">
      <Button type="button" onClick={() => setOpen(true)}>
        {copy.addGroup}
      </Button>
      <OpsDialog open={open} onClose={() => setOpen(false)}>
        <OpsDialogHeader title={copy.addGroup} />
        <OpsDialogBody>
          <form onSubmit={create} className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="ops-group-label">{english ? copy.labelEn : copy.labelPt}</Label>
              <Input id="ops-group-label" value={label} onChange={(ev) => setLabel(ev.target.value)} required />
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
        </OpsDialogBody>
      </OpsDialog>
    </div>
  );
}
