'use client';

import { useState } from 'react';
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from '@community/ui';
import { OpsBadge, OpsMoveButtons } from '@community/ui-admin';
import { pickLocalizedText } from '@community/identity';
import { fieldCanFilter, fieldNeedsOptions, type CatalogCopy, type OpsField, type OpsGroup } from './community-fields-types';
import { CommunityFieldsOptionsEditor, emptyOptionRow } from './community-fields-options';

export function CommunityFieldsField({
  communityId,
  field,
  index,
  total,
  locale,
  copy,
  onChanged,
  onMove,
  onRemove,
  groups,
  currentGroupId,
}: {
  communityId: string;
  field: OpsField;
  index: number;
  total: number;
  locale: string | undefined;
  copy: CatalogCopy;
  onChanged: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onRemove: () => void;
  groups: OpsGroup[];
  currentGroupId: string;
}) {
  const [open, setOpen] = useState(false);
  const [labelPt, setLabelPt] = useState(pickLocalizedText(field.label, 'pt-BR') || field.name);
  const [labelEn, setLabelEn] = useState(pickLocalizedText(field.label, 'en') || '');
  const [options, setOptions] = useState(
    field.options?.length ? field.options : [emptyOptionRow()]
  );
  const [filterable, setFilterable] = useState(field.filterable);
  const [busy, setBusy] = useState(false);
  const spanId = `ops-field-span-${field.id}`;

  const setGroup = async (groupId: string) => {
    if (groupId === currentGroupId) {
      return;
    }
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    onChanged();
  };

  const setSpan = async (span: number) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ span }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    onChanged();
  };

  const save = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        labelPt,
        labelEn,
        options,
        filterable,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    setOpen(false);
    onChanged();
  };

  return (
    <li className="rounded-md border border-border bg-background px-3 py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="text-sm font-medium wrap-break-word">
              {pickLocalizedText(field.label, locale) || field.name}
            </p>
            {field.locked ? <OpsBadge>{copy.locked}</OpsBadge> : null}
          </div>
          <p className="font-mono text-xs text-muted-foreground wrap-break-word">
            {field.name} · {field.type} · {field.storage}
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <div className="flex min-w-0 items-center gap-2">
            <Label htmlFor={`ops-field-group-${field.id}`} className="text-xs text-muted-foreground whitespace-nowrap">
              {copy.moveGroup}
            </Label>
            <Select value={currentGroupId} onValueChange={(next) => void setGroup(next)}>
              <SelectTrigger id={`ops-field-group-${field.id}`} size="sm" className="w-[min(100%,12rem)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {pickLocalizedText(item.label, locale) || item.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Label htmlFor={spanId} className="text-xs text-muted-foreground whitespace-nowrap">
              {copy.span}
            </Label>
            <Select value={String(field.span)} onValueChange={(next) => void setSpan(Number(next))}>
              <SelectTrigger id={spanId} size="sm" className="w-[4.75rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <OpsMoveButtons
            moveUp={copy.moveUp}
            moveDown={copy.moveDown}
            canUp={index > 0}
            canDown={index < total - 1}
            onMove={onMove}
          />
          {field.locked ? null : (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
                {copy.edit}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onRemove}>
                {copy.delete}
              </Button>
            </>
          )}
        </div>
      </div>
      {open && !field.locked ? (
        <div className="mt-3 grid max-w-3xl gap-3 border-t border-border pt-3">
          <div className="space-y-2">
            <Label htmlFor={`ops-field-pt-${field.id}`}>{copy.labelPt}</Label>
            <Input
              id={`ops-field-pt-${field.id}`}
              value={labelPt}
              onChange={(ev) => setLabelPt(ev.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`ops-field-en-${field.id}`}>{copy.labelEn}</Label>
            <Input
              id={`ops-field-en-${field.id}`}
              value={labelEn}
              onChange={(ev) => setLabelEn(ev.target.value)}
            />
          </div>
          {fieldNeedsOptions(field.type) ? (
            <CommunityFieldsOptionsEditor
              idPrefix={`ops-field-opt-${field.id}`}
              rows={options}
              onChange={setOptions}
              copy={copy}
            />
          ) : null}
          {fieldCanFilter(field.type) ? (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={filterable} onCheckedChange={(checked) => setFilterable(checked === true)} />
              {copy.filterable}
            </label>
          ) : null}
          <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>
            {copy.save}
          </Button>
        </div>
      ) : null}
    </li>
  );
}
