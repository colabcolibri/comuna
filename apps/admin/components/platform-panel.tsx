'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Input, Label, toast } from '@community/ui';
import { OpsPageTemplate } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  kicker: 'platform.kicker',
  title: 'platform.title',
  subtitle: 'platform.subtitle',
  product: 'platform.product_name',
  fromName: 'platform.from_name',
  fromAddress: 'platform.from_address',
  support: 'platform.support_url',
  logo: 'platform.logo_url',
  save: 'community.save',
  saved: 'platform.saved',
  error: 'community.save_error',
});

type Settings = {
  product_name: string;
  from_name: string;
  from_address: string;
  support_url: string;
  logo_url: string;
};

export function PlatformPanel() {
  const copy = pickContent(CONTENT, useLocale());
  const [form, setForm] = useState<Settings>({
    product_name: '',
    from_name: '',
    from_address: '',
    support_url: '',
    logo_url: '',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/admin/platform').then(async (res) => {
      if (!res.ok) {
        return;
      }
      setForm(await res.json());
    });
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/admin/platform', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    setForm(await res.json());
    toast.success(copy.saved);
  };

  return (
    <OpsPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <form onSubmit={(ev) => void save(ev)} className="grid max-w-lg gap-4">
        <div className="space-y-2">
          <Label htmlFor="ops-platform-product">{copy.product}</Label>
          <Input
            id="ops-platform-product"
            value={form.product_name}
            onChange={(ev) => setForm((current) => ({ ...current, product_name: ev.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-platform-from-name">{copy.fromName}</Label>
          <Input
            id="ops-platform-from-name"
            value={form.from_name}
            onChange={(ev) => setForm((current) => ({ ...current, from_name: ev.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-platform-from">{copy.fromAddress}</Label>
          <Input
            id="ops-platform-from"
            type="email"
            value={form.from_address}
            onChange={(ev) => setForm((current) => ({ ...current, from_address: ev.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-platform-support">{copy.support}</Label>
          <Input
            id="ops-platform-support"
            value={form.support_url}
            onChange={(ev) => setForm((current) => ({ ...current, support_url: ev.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ops-platform-logo">{copy.logo}</Label>
          <Input
            id="ops-platform-logo"
            value={form.logo_url}
            onChange={(ev) => setForm((current) => ({ ...current, logo_url: ev.target.value }))}
          />
        </div>
        <Button type="submit" disabled={busy}>
          {copy.save}
        </Button>
      </form>
    </OpsPageTemplate>
  );
}
