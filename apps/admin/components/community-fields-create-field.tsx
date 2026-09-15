'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Label, toast } from '@community/ui';
import { pickLocalizedText } from '@community/identity';
import { CATALOG_SELECT_CLASS, type CatalogCopy, type OpsGroup } from './community-fields-types';

export function CommunityFieldsCreateField({
  communityId,
  groups,
  locale,
  copy,
  onCreated,
}: {
  communityId: string;
  groups: OpsGroup[];
  locale: string | undefined;
  copy: CatalogCopy;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [name, setName] = useState('');
  const [type, setType] = useState('boolean');
  const [labelPt, setLabelPt] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [filterable, setFilterable] = useState(true);
  const [busy, setBusy] = useState(false);

  const selectedGroup = groupId || groups[0]?.id || '';

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: selectedGroup,
        name,
        type,
        labelPt,
        labelEn,
        optionsText,
        filterable,
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
    setName('');
    setLabelPt('');
    setLabelEn('');
    setOptionsText('');
    setOpen(false);
    onCreated();
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0">
      <Button type="button" variant="outline" onClick={() => setOpen((value) => !value)}>
        {copy.add}
      </Button>
      {open ? (
        <form onSubmit={create} className="mt-4 grid max-w-lg gap-4">
          <div className="space-y-2">
            <Label htmlFor="ops-field-group">{copy.group}</Label>
            <select
              id="ops-field-group"
              className={CATALOG_SELECT_CLASS}
              value={selectedGroup}
              onChange={(ev) => setGroupId(ev.target.value)}
              required
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {pickLocalizedText(group.label, locale) || group.slug}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-field-name">{copy.name}</Label>
            <Input id="ops-field-name" className="font-mono" value={name} onChange={(ev) => setName(ev.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-field-type">{copy.type}</Label>
            <select
              id="ops-field-type"
              className={CATALOG_SELECT_CLASS}
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
    </div>
  );
}
