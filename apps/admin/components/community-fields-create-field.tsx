'use client';

import { FormEvent, useState } from 'react';
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from '@community/ui';
import { fieldCanFilter, fieldNeedsOptions, type CatalogCopy } from './community-fields-types';
import { CommunityFieldsOptionsEditor, emptyOptionRow, type OptionRow } from './community-fields-options';

export function CommunityFieldsCreateField({
  communityId,
  groupId,
  copy,
  onCreated,
}: {
  communityId: string;
  groupId: string;
  copy: CatalogCopy;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('boolean');
  const [labelPt, setLabelPt] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [options, setOptions] = useState<OptionRow[]>([emptyOptionRow()]);
  const [filterable, setFilterable] = useState(true);
  const [required, setRequired] = useState(false);
  const [busy, setBusy] = useState(false);
  const idPrefix = `ops-new-field-${groupId}`;

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        name,
        type,
        labelPt,
        labelEn,
        options,
        filterable,
        required,
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
    setOptions([emptyOptionRow()]);
    setFilterable(true);
    setRequired(false);
    setOpen(false);
    toast.success(copy.saved);
    onCreated();
  };

  return (
    <div className="min-w-0">
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
        {copy.add}
      </Button>
      {open ? (
        <form onSubmit={create} className="mt-4 grid max-w-3xl gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-pt`}>{copy.labelPt}</Label>
            <Input id={`${idPrefix}-pt`} value={labelPt} onChange={(ev) => setLabelPt(ev.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-en`}>{copy.labelEn}</Label>
            <Input id={`${idPrefix}-en`} value={labelEn} onChange={(ev) => setLabelEn(ev.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-type`}>{copy.type}</Label>
            <Select
              value={type}
              onValueChange={(next) => {
                setType(next);
                if (fieldNeedsOptions(next) && options.every((row) => !row.value.trim())) {
                  setOptions([emptyOptionRow()]);
                }
              }}
            >
              <SelectTrigger id={`${idPrefix}-type`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">{copy.typeBoolean}</SelectItem>
                <SelectItem value="select">{copy.typeSelect}</SelectItem>
                <SelectItem value="radio">{copy.typeRadio}</SelectItem>
                <SelectItem value="checkbox">{copy.typeCheckbox}</SelectItem>
                <SelectItem value="text">{copy.typeText}</SelectItem>
                <SelectItem value="textarea">{copy.typeTextarea}</SelectItem>
                <SelectItem value="localized_text">{copy.typeLocalized}</SelectItem>
                <SelectItem value="url">{copy.typeUrl}</SelectItem>
                <SelectItem value="city">{copy.typeCity}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-name`}>{copy.name}</Label>
            <Input
              id={`${idPrefix}-name`}
              className="font-mono"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">{copy.nameHelp}</p>
          </div>
          {fieldNeedsOptions(type) ? (
            <CommunityFieldsOptionsEditor idPrefix={`${idPrefix}-opt`} rows={options} onChange={setOptions} copy={copy} />
          ) : null}
          {fieldCanFilter(type) ? (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={filterable} onCheckedChange={(checked) => setFilterable(checked === true)} />
              {copy.filterable}
            </label>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={required} onCheckedChange={(checked) => setRequired(checked === true)} />
            {copy.required}
          </label>
          <div className="flex min-w-0 flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {copy.create}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {copy.cancel}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
