'use client';

import { FormEvent, useState } from 'react';
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, toast } from '@community/ui';
import { pickLocalizedText } from '@community/identity';
import { fieldCanFilter, fieldNeedsOptions, type CatalogCopy, type OpsGroup } from './community-fields-types';

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
            <Select value={selectedGroup} onValueChange={setGroupId}>
              <SelectTrigger id="ops-field-group">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {pickLocalizedText(group.label, locale) || group.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-field-name">{copy.name}</Label>
            <Input id="ops-field-name" className="font-mono" value={name} onChange={(ev) => setName(ev.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-field-type">{copy.type}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="ops-field-type">
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
            <Label htmlFor="ops-field-pt">{copy.labelPt}</Label>
            <Input id="ops-field-pt" value={labelPt} onChange={(ev) => setLabelPt(ev.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ops-field-en">{copy.labelEn}</Label>
            <Input id="ops-field-en" value={labelEn} onChange={(ev) => setLabelEn(ev.target.value)} />
          </div>
          {fieldNeedsOptions(type) ? (
            <div className="space-y-2">
              <Label htmlFor="ops-field-options">{copy.options}</Label>
              <Textarea
                id="ops-field-options"
                className="min-h-24 w-full font-mono text-sm"
                value={optionsText}
                onChange={(ev) => setOptionsText(ev.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">{copy.optionsHelp}</p>
            </div>
          ) : null}
          {fieldCanFilter(type) ? (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={filterable} onCheckedChange={(checked) => setFilterable(checked === true)} />
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
