'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Checkbox, Input, Label, toast } from '@community/ui';
import { OpsAlertDialog, OpsSection, OpsTable } from '@community/ui-admin';
import { contentFromCatalog, pickContent, pickLocalizedText } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.talent_categories',
  help: 'community.talent_categories_help',
  empty: 'community.talent_categories_empty',
  labelPt: 'community.talent_categories_label_pt',
  labelEn: 'community.talent_categories_label_en',
  code: 'community.talent_categories_code',
  allowsOther: 'community.talent_categories_allows_other',
  enabled: 'community.talent_categories_enabled',
  create: 'community.talent_categories_create',
  created: 'community.talent_categories_created',
  saved: 'community.saved',
  delete: 'community.fields_delete',
  deleteTitle: 'community.talent_categories_delete_title',
  deleteBody: 'community.talent_categories_delete_body',
  cancel: 'community.fields_cancel',
  error: 'community.save_error',
});

type Row = {
  id: string;
  sortOrder: number;
  label: { 'pt-BR'?: string; en?: string };
  allowsOtherText: boolean;
  enabled: boolean;
};

export function CommunityTalentCategories({ communityId }: { communityId: string }) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [rows, setRows] = useState<Row[]>([]);
  const [labelPt, setLabelPt] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [code, setCode] = useState('');
  const [allowsOther, setAllowsOther] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/admin/communities/${communityId}/talent-categories`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  };

  useEffect(() => {
    load();
  }, [communityId]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/talent-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelPt, labelEn, code, allowsOtherText: allowsOther }),
    });
    setBusy(false);
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message || copy.error);
      return;
    }
    setLabelPt('');
    setLabelEn('');
    setCode('');
    setAllowsOther(false);
    toast.success(copy.created);
    load();
  };

  const toggleEnabled = async (row: Row) => {
    const res = await fetch(`/api/admin/communities/${communityId}/talent-categories/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !row.enabled }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/communities/${communityId}/talent-categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message || copy.error);
      return;
    }
    load();
  };

  return (
    <OpsSection title={copy.title} description={copy.help}>
      <form onSubmit={add} className="mb-8 grid max-w-xl gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="talent-cat-pt">{copy.labelPt}</Label>
            <Input id="talent-cat-pt" value={labelPt} onChange={(ev) => setLabelPt(ev.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="talent-cat-en">{copy.labelEn}</Label>
            <Input id="talent-cat-en" value={labelEn} onChange={(ev) => setLabelEn(ev.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="talent-cat-code">{copy.code}</Label>
          <Input
            id="talent-cat-code"
            value={code}
            onChange={(ev) => setCode(ev.target.value)}
            placeholder="mentoria_produto"
            className="font-mono text-sm"
          />
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <Checkbox checked={allowsOther} onCheckedChange={(checked) => setAllowsOther(checked === true)} />
          {copy.allowsOther}
        </label>
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {copy.create}
        </Button>
      </form>
      <OpsTable
        columns={[
          {
            id: 'label',
            header: copy.labelPt,
            cell: (row) => pickLocalizedText(row.label, locale) || row.id,
          },
          { id: 'code', header: copy.code, cell: (row) => <span className="font-mono text-xs">{row.id}</span> },
          {
            id: 'enabled',
            header: copy.enabled,
            cell: (row) => (
              <Button type="button" size="sm" variant={row.enabled ? 'default' : 'secondary'} onClick={() => void toggleEnabled(row)}>
                {row.enabled ? 'on' : 'off'}
              </Button>
            ),
          },
          {
            id: 'action',
            header: copy.delete,
            cell: (row) => (
              <Button type="button" size="sm" variant="outline" onClick={() => setPendingId(row.id)}>
                {copy.delete}
              </Button>
            ),
          },
        ]}
        rows={rows}
        empty={copy.empty}
        rowKey={(row) => row.id}
      />
      <OpsAlertDialog
        isOpen={pendingId !== null}
        onClose={() => setPendingId(null)}
        title={copy.deleteTitle}
        description={copy.deleteBody}
        cancelLabel={copy.cancel}
        confirmLabel={copy.delete}
        confirmVariant="destructive"
        onConfirm={() => {
          const id = pendingId;
          setPendingId(null);
          if (id) {
            void remove(id);
          }
        }}
      />
    </OpsSection>
  );
}
