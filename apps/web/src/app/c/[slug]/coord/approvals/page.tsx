'use client';

import React, { useEffect, useState } from 'react';
import { contentFromCatalog, pickContent } from '@community/identity';
import { AppPageTemplate } from '@community/ui-member';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_membership', {
  kicker: 'coord.kicker',
  title: 'coord.title',
  subtitle: 'coord.subtitle',
  empty: 'coord.empty',
  forbidden: 'coord.forbidden',
  approve: 'coord.approve',
  reject: 'coord.reject',
  notice: 'coord.notice',
});

type Row = { id: string; full_name: string; network_status: string };

export default function CoordApprovalsPage() {
  const copy = pickContent(CONTENT, useLocale());
  const [rows, setRows] = useState<Row[]>([]);
  const [forbidden, setForbidden] = useState(false);

  const load = () => {
    fetch('/api/coord/approvals').then(async (res) => {
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const json = await res.json();
      setRows(json.pending || []);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (membershipId: string, action: 'approve' | 'reject') => {
    await fetch('/api/coord/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipId, action }),
    });
    load();
  };

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <aside className="mb-6 rounded-lg bg-background border border-border p-4 text-sm text-muted-foreground">{copy.notice}</aside>
      {forbidden && <p>{copy.forbidden}</p>}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {!forbidden && rows.length === 0 && <p className="p-6 text-muted-foreground">{copy.empty}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border">
                  <td className="px-4 py-4 font-medium">{row.full_name}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        className="min-h-11 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
                        onClick={() => act(row.id, 'approve')}
                      >
                        {copy.approve}
                      </button>
                      <button
                        className="min-h-11 px-4 border border-border rounded-lg text-sm text-destructive bg-destructive-tint"
                        onClick={() => act(row.id, 'reject')}
                      >
                        {copy.reject}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppPageTemplate>
  );
}
