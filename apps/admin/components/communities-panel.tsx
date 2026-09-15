'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'communities.title',
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
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">{copy.title}</h1>
        <Button type="button" onClick={() => setOpen((value) => !value)}>
          {copy.add}
        </Button>
      </div>
      {open ? (
        <form onSubmit={create} className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-end">
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
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/80 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">{copy.colName}</th>
                <th className="px-4 py-3 font-medium">{copy.colSlug}</th>
                <th className="px-4 py-3 font-medium w-28">{copy.edit}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium min-w-0">
                    <Link href={`/communities/${row.id}`} className="text-foreground hover:underline">
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground break-all">{row.slug}</td>
                  <td className="px-4 py-3">
                    <Button variant="link" className="h-auto px-0" asChild>
                      <Link href={`/communities/${row.id}`}>{copy.edit}</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
