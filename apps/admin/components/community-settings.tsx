'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, toast } from '@community/ui';
import { OpsSection } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.settings',
  help: 'community.settings_help',
  name: 'communities.name',
  slug: 'communities.slug',
  type: 'community.type',
  save: 'community.save',
  saved: 'community.saved',
  error: 'community.save_error',
});

export function CommunitySettings({
  communityId,
  name,
  slug,
  type,
}: {
  communityId: string;
  name: string;
  slug: string;
  type: string;
}) {
  const copy = pickContent(CONTENT, useLocale());
  const router = useRouter();
  const [nameValue, setNameValue] = useState(name);
  const [typeValue, setTypeValue] = useState(type);
  const [busy, setBusy] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameValue, type: typeValue }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    router.refresh();
  };

  return (
    <OpsSection title={copy.title} description={copy.help}>
      <form onSubmit={save} className="grid max-w-lg gap-4">
        <div className="space-y-2">
          <Label htmlFor="ops-community-name">{copy.name}</Label>
          <Input id="ops-community-name" value={nameValue} onChange={(ev) => setNameValue(ev.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-community-slug">{copy.slug}</Label>
          <Input id="ops-community-slug" className="font-mono" value={slug} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-community-type">{copy.type}</Label>
          <Input id="ops-community-type" value={typeValue} onChange={(ev) => setTypeValue(ev.target.value)} required />
        </div>
        <Button type="submit" disabled={busy}>
          {copy.save}
        </Button>
      </form>
    </OpsSection>
  );
}
