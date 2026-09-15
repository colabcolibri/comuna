'use client';

import { useEffect, useState } from 'react';
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from '@community/ui';
import { OpsAlertDialog, OpsBadge, OpsMoveButtons } from '@community/ui-admin';
import { pickLocalizedText } from '@community/identity';
import {
  clampFieldSpan,
  fieldCanFilter,
  fieldNeedsOptions,
  fieldSpanChoices,
  fieldTypeLabel,
  type CatalogCopy,
  type OpsField,
  type OpsGroup,
} from './community-fields-types';
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
  groupColumns,
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
  groupColumns: number;
}) {
  const [open, setOpen] = useState(false);
  const [labelPt, setLabelPt] = useState(pickLocalizedText(field.label, 'pt-BR') || field.name);
  const [labelEn, setLabelEn] = useState(pickLocalizedText(field.label, 'en') || '');
  const [options, setOptions] = useState(field.options?.length ? field.options : [emptyOptionRow()]);
  const [filterable, setFilterable] = useState(field.filterable);
  const [busy, setBusy] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const spanChoices = fieldSpanChoices(groupColumns);
  const showSpan = groupColumns > 1;
  const spanId = `ops-field-span-${field.id}`;
  const requiredId = `ops-field-required-${field.id}`;

  useEffect(() => {
    setLabelPt(pickLocalizedText(field.label, 'pt-BR') || field.name);
    setLabelEn(pickLocalizedText(field.label, 'en') || '');
    setOptions(field.options?.length ? field.options : [emptyOptionRow()]);
    setFilterable(field.filterable);
  }, [field]);

  const setGroup = async (groupId: string) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    setPendingGroupId(null);
    setOpen(false);
    onChanged();
  };

  const setSpan = async (span: number) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ span: clampFieldSpan(span, groupColumns) }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    onChanged();
  };

  const setRequired = async (required: boolean) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ required }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    onChanged();
  };

  const setEnabled = async (enabled: boolean) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
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
    toast.success(copy.saved);
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
            {field.enabled ? null : <OpsBadge>{copy.inactive}</OpsBadge>}
          </div>
          <p className="text-xs text-muted-foreground wrap-break-word">
            {fieldTypeLabel(field.type, copy)} · {field.required ? copy.required : copy.optional}
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <OpsMoveButtons
            moveUp={copy.moveUp}
            moveDown={copy.moveDown}
            canUp={index > 0}
            canDown={index < total - 1}
            onMove={onMove}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
            {copy.edit}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void setEnabled(!field.enabled)}
          >
            {field.enabled ? copy.deactivate : copy.activate}
          </Button>
          {field.locked || field.enabled ? null : (
            <Button type="button" size="sm" variant="outline" onClick={() => setPendingDelete(true)}>
              {copy.delete}
            </Button>
          )}
        </div>
      </div>
      {open ? (
        <div className="mt-3 grid max-w-3xl gap-3 border-t border-border pt-3">
          {field.locked ? <p className="text-sm text-muted-foreground">{copy.lockedHint}</p> : null}
          {field.locked ? null : (
            <>
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
              <p className="text-xs text-muted-foreground">
                {copy.name}: <span className="font-mono break-all">{field.name}</span>
              </p>
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
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor={requiredId}>{copy.requirement}</Label>
            <Select value={field.required ? 'required' : 'optional'} onValueChange={(next) => void setRequired(next === 'required')}>
              <SelectTrigger id={requiredId} className="w-[min(100%,16rem)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="optional">{copy.optional}</SelectItem>
                <SelectItem value="required">{copy.required}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showSpan ? (
            <div className="space-y-2">
              <Label htmlFor={spanId}>{copy.span}</Label>
              <Select
                value={String(clampFieldSpan(field.span, groupColumns))}
                onValueChange={(next) => void setSpan(Number(next))}
              >
                <SelectTrigger id={spanId} className="w-[min(100%,12rem)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {spanChoices.map((span) => (
                    <SelectItem key={span} value={String(span)}>
                      {span}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{copy.spanHelp}</p>
            </div>
          ) : null}
          {groups.length > 1 ? (
            <div className="space-y-2">
              <Label htmlFor={`ops-field-group-${field.id}`}>{copy.moveGroup}</Label>
              <Select
                value={currentGroupId}
                onValueChange={(next) => {
                  if (next === currentGroupId) {
                    return;
                  }
                  setPendingGroupId(next);
                }}
              >
                <SelectTrigger id={`ops-field-group-${field.id}`} className="w-[min(100%,16rem)]">
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
              <p className="text-xs text-muted-foreground">{copy.moveGroupHelp}</p>
            </div>
          ) : null}
          {field.locked ? null : (
            <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>
              {copy.save}
            </Button>
          )}
        </div>
      ) : null}
      <OpsAlertDialog
        isOpen={pendingGroupId !== null}
        onClose={() => setPendingGroupId(null)}
        title={copy.moveGroupConfirm}
        description={copy.moveGroupHelp}
        cancelLabel={copy.cancel}
        confirmLabel={copy.moveGroup}
        onConfirm={() => pendingGroupId && void setGroup(pendingGroupId)}
      />
      <OpsAlertDialog
        isOpen={pendingDelete}
        onClose={() => setPendingDelete(false)}
        title={copy.deleteTitle}
        description={copy.deleteBody}
        cancelLabel={copy.cancel}
        confirmLabel={copy.delete}
        confirmVariant="destructive"
        onConfirm={() => {
          setPendingDelete(false);
          onRemove();
        }}
      />
    </li>
  );
}
