'use client';

import React, { useEffect, useState } from 'react';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'ops.title',
  create: 'ops.create',
  slug: 'ops.slug',
  name: 'ops.name',
  modules: 'ops.modules',
  forbidden: 'ops.forbidden',
});

type Community = { id: string; slug: string; name: string; type: string };

export default function OpsPage() {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Community[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');

  const load = () => {
    fetch('/api/ops/communities').then(async (res) => {
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/ops/communities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name, type: 'alumni' }),
    });
    setSlug('');
    setName('');
    load();
  };

  const toggle = async (id: string, moduleSlug: string, enabled: boolean) => {
    await fetch(`/api/admin/communities/${id}/modules/${moduleSlug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  };

  if (forbidden) {
    return (
      <main className="p-6">
        <h1>{copy.title}</h1>
        <p>{copy.forbidden}</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1>{copy.title}</h1>
      <form onSubmit={create} className="flex flex-col sm:flex-row gap-2 my-4">
        <input className="border p-2 rounded" placeholder={copy.slug} value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className="border p-2 rounded" placeholder={copy.name} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">{copy.create}</button>
      </form>
      <table className="w-full text-left">
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="py-2">{row.slug}</td>
              <td>{row.name}</td>
              <td className="py-2">
                {['directory', 'showcase', 'contact-mediated'].map((moduleSlug) => (
                  <label key={moduleSlug} className="mr-3 text-sm">
                    <input type="checkbox" defaultChecked onChange={(e) => toggle(row.id, moduleSlug, e.target.checked)} /> {moduleSlug}
                  </label>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
