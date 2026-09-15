'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Input, Label, toast } from '@community/ui';
import { OpsSection, OpsTable } from '@community/ui-admin';
import { contentFromCatalog, pickContent, pickLocalizedText, type LocalizedText } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.fields',
  help: 'community.fields_help',
  empty: 'community.fields_empty',
  add: 'community.fields_add',
  name: 'community.fields_name',
  type: 'community.fields_type',
  labelPt: 'community.fields_label_pt',
  labelEn: 'community.fields_label_en',
  options: 'community.fields_options',
  optionsHelp: 'community.fields_options_help',
  filterable: 'community.fields_filterable',
  create: 'community.fields_create',
  locked: 'community.fields_locked',
  delete: 'community.fields_delete',
  colGroup: 'community.fields_col_group',
  colName: 'community.fields_col_name',
  colType: 'community.fields_col_type',
  colStorage: 'community.fields_col_storage',
  error: 'community.save_error',
  duplicate: 'community.fields_duplicate',
  typeText: 'community.fields_type_text',
  typeTextarea: 'community.fields_type_textarea',
  typeBoolean: 'community.fields_type_boolean',
  typeSelect: 'community.fields_type_select',
  typeUrl: 'community.fields_type_url',
});

type OpsField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  locked: boolean;
  filterable: boolean;
  label: LocalizedText;
};

type OpsGroup = {
  id: string;
  slug: string;
  label: LocalizedText;
  fields: OpsField[];
};

export function CommunityFields({ communityId }: { communityId: string }) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [groups, setGroups] = useState<OpsGroup[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('boolean');
  const [labelPt, setLabelPt] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [filterable, setFilterable] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/communities/${communityId}/fields`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setGroups(json.data || []);
    });
  }, [communityId]);

  const rows = groups.flatMap((group) =>
    group.fields.map((field) => ({
      ...field,
      groupLabel: pickLocalizedText(group.label, locale) || group.slug,
    }))
  );

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, labelPt, labelEn, optionsText, filterable }),
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
    setName('');
    setLabelPt('');
    setLabelEn('');
    setOptionsText('');
    setOpen(false);
    load();
  };

  const remove = async (fieldId: string) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${fieldId}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    load();
  };

  return (
    <OpsSection
      title={copy.title}
      description={copy.help}
    >
      <div className="mb-6">
        <Button type="button" variant="outline" onClick={() => setOpen((value) => !value)}>
          {copy.add}
        </Button>
      </div>
      {open ? (
        <form onSubmit={create} className="mb-8 grid max-w-lg gap-4">
          <div className="space-y-2">
            <Label htmlFor="ops-field-name">{copy.name}</Label>
            <Input id="ops-field-name" className="font-mono" value={name} onChange={(ev) => setName(ev.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-field-type">{copy.type}</Label>
            <select
              id="ops-field-type"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={type}
              onChange={(ev) => setType(ev.target.value)}
            >
              <option value="boolean">{copy.typeBoolean}</option>
              <option value="select">{copy.typeSelect}</option>
              <option value="text">{copy.typeText}</option>
              <option value="textarea">{copy.typeTextarea}</option>
              <option value="url">{copy.typeUrl}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-field-pt">{copy.labelPt}</Label>
            <Input id="ops-field-pt" value={labelPt} onChange={(ev) => setLabelPt(ev.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-field-en">{copy.labelEn}</Label>
            <Input id="ops-field-en" value={labelEn} onChange={(ev) => setLabelEn(ev.target.value)} />
          </div>
          {type === 'select' ? (
            <div className="space-y-2">
              <Label htmlFor="ops-field-options">{copy.options}</Label>
              <textarea
                id="ops-field-options"
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                value={optionsText}
                onChange={(ev) => setOptionsText(ev.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">{copy.optionsHelp}</p>
            </div>
          ) : null}
          {type === 'boolean' || type === 'select' ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filterable} onChange={(ev) => setFilterable(ev.target.checked)} />
              {copy.filterable}
            </label>
          ) : null}
          <Button type="submit" disabled={busy}>
            {copy.create}
          </Button>
        </form>
      ) : null}
      <OpsTable
        columns={[
          { id: 'group', header: copy.colGroup, cell: (row) => row.groupLabel },
          {
            id: 'label',
            header: copy.colName,
            cell: (row) => pickLocalizedText(row.label, locale) || row.name,
          },
          { id: 'name', header: copy.name, className: 'font-mono', cell: (row) => row.name },
          { id: 'type', header: copy.colType, className: 'font-mono', cell: (row) => row.type },
          { id: 'storage', header: copy.colStorage, className: 'font-mono', cell: (row) => row.storage },
          {
            id: 'action',
            header: copy.delete,
            cell: (row) =>
              row.locked ? (
                <span className="text-xs text-muted-foreground">{copy.locked}</span>
              ) : (
                <Button type="button" size="sm" variant="outline" onClick={() => void remove(row.id)}>
                  {copy.delete}
                </Button>
              ),
          },
        ]}
        rows={rows}
        empty={copy.empty}
        rowKey={(row) => row.id}
      />
    </OpsSection>
  );
}
