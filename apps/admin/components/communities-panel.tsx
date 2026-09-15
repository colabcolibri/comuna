'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'communities.title',
  create: 'communities.create',
  slug: 'communities.slug',
  name: 'communities.name',
  empty: 'communities.empty',
  duplicate: 'communities.duplicate',
});

type Community = { id: string; slug: string; name: string; type: string };

export function CommunitiesPanel() {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Community[]>([]);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

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
    load();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold">{copy.title}</h1>
      <form onSubmit={create} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1 min-w-0">
          <Label htmlFor="slug">{copy.slug}</Label>
          <Input id="slug" value={slug} onChange={(ev) => setSlug(ev.target.value)} required />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <Label htmlFor="name">{copy.name}</Label>
          <Input id="name" value={name} onChange={(ev) => setName(ev.target.value)} required />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            {copy.create}
          </Button>
        </div>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="divide-y border rounded-md overflow-hidden">
          {rows.map((row) => (
            <li key={row.id} className="px-3 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
              <span className="font-mono text-sm break-all">{row.slug}</span>
              <span className="text-sm truncate">{row.name}</span>
              <Link href={`/communities/${row.id}`} className="sm:ml-auto text-sm underline min-h-11 inline-flex items-center">
                {row.id.slice(0, 8)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
