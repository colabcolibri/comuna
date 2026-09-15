'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@community/ui';
import { OpsPageTemplate, OpsTable } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  kicker: 'communities.kicker',
  title: 'communities.title',
  subtitle: 'communities.subtitle',
  add: 'communities.add',
  create: 'communities.create',
  slug: 'communities.slug',
  name: 'communities.name',
  empty: 'communities.empty',
  duplicate: 'communities.duplicate',
  edit: 'communities.edit',
  colName: 'communities.col_name',
  colSlug: 'communities.col_slug',
});

type Community = { id: string; slug: string; name: string; type: string };

export function CommunitiesPanel() {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Community[]>([]);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => {
    fetch('/api/admin/communities').then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/communities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name }),
    });
    if (res.status === 400) {
      setError(copy.duplicate);
      return;
    }
    if (!res.ok) {
      return;
    }
    setSlug('');
    setName('');
    setOpen(false);
    load();
  };

  return (
    <OpsPageTemplate
      kicker={copy.kicker}
      title={copy.title}
      subtitle={copy.subtitle}
      actions={
        <Button type="button" onClick={() => setOpen((value) => !value)}>
          {copy.add}
        </Button>
      }
    >
      {open ? (
        <form onSubmit={create} className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 min-w-0 space-y-2">
            <Label htmlFor="community-name">{copy.name}</Label>
            <Input id="community-name" value={name} onChange={(ev) => setName(ev.target.value)} required />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <Label htmlFor="community-slug">{copy.slug}</Label>
            <Input id="community-slug" className="font-mono" value={slug} onChange={(ev) => setSlug(ev.target.value)} required />
          </div>
          <Button type="submit">{copy.create}</Button>
        </form>
      ) : null}
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      <OpsTable
        columns={[
          {
            id: 'name',
            header: copy.colName,
            cell: (row) => (
              <Link href={`/communities/${row.id}`} className="font-medium text-foreground hover:underline">
                {row.name}
              </Link>
            ),
          },
          {
            id: 'slug',
            header: copy.colSlug,
            className: 'font-mono text-muted-foreground break-all',
            cell: (row) => row.slug,
          },
          {
            id: 'edit',
            header: copy.edit,
            className: 'w-28',
            cell: (row) => (
              <Button variant="link" className="h-auto px-0" asChild>
                <Link href={`/communities/${row.id}`}>{copy.edit}</Link>
              </Button>
            ),
          },
        ]}
        rows={rows}
        empty={copy.empty}
        rowKey={(row) => row.id}
      />
    </OpsPageTemplate>
  );
}
