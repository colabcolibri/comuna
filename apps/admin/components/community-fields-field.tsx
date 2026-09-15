'use client';

import { useEffect, useState } from 'react';
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from '@community/ui';
import { OpsAlertDialog, OpsBadge, OpsCheckboxFrame, OpsMoveButtons } from '@community/ui-admin';
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
  const [required, setRequired] = useState(field.required);
  const [span, setSpan] = useState(clampFieldSpan(field.span, groupColumns));
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
    setRequired(field.required);
    setSpan(clampFieldSpan(field.span, groupColumns));
  }, [field, groupColumns]);

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

  const patchField = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  };

  const save = async () => {
    setBusy(true);
    const canFilter = fieldCanFilter(field.type);
    const nextSpan = clampFieldSpan(span, groupColumns);
    let ok = true;
    if (!field.locked) {
      ok = await patchField({ labelPt, labelEn, options, filterable: canFilter ? filterable : false });
    } else if (canFilter) {
      ok = await patchField({ filterable });
    }
    if (ok && required !== field.required) {
      ok = await patchField({ required });
    }
    if (ok && showSpan && nextSpan !== clampFieldSpan(field.span, groupColumns)) {
      ok = await patchField({ span: nextSpan });
    }
    setBusy(false);
    if (!ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    setOpen(false);
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

  const canFilter = fieldCanFilter(field.type);
  const filterId = `ops-field-filter-${field.id}`;

  return (
    <li className="min-w-0 py-3">
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
        <div className="mt-3 min-w-0 space-y-4 border-t border-border pt-3">
          {field.locked ? <p className="text-sm text-muted-foreground">{copy.lockedHint}</p> : null}
          {field.locked ? null : (
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor={`ops-field-pt-${field.id}`}>{copy.labelPt}</Label>
                <Input
                  id={`ops-field-pt-${field.id}`}
                  value={labelPt}
                  onChange={(ev) => setLabelPt(ev.target.value)}
                />
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor={`ops-field-en-${field.id}`}>{copy.labelEn}</Label>
                <Input
                  id={`ops-field-en-${field.id}`}
                  value={labelEn}
                  onChange={(ev) => setLabelEn(ev.target.value)}
                />
              </div>
            </div>
          )}
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="min-w-0 space-y-2">
              <Label>{copy.type}</Label>
              <p className="flex h-11 items-center text-sm text-foreground">{fieldTypeLabel(field.type, copy)}</p>
            </div>
            <div className="min-w-0 space-y-2">
              <Label>{copy.name}</Label>
              <p className="flex min-h-11 items-center font-mono text-sm break-all">{field.name}</p>
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor={requiredId}>{copy.requirement}</Label>
              <Select value={required ? 'required' : 'optional'} onValueChange={(next) => setRequired(next === 'required')}>
                <SelectTrigger id={requiredId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">{copy.optional}</SelectItem>
                  <SelectItem value="required">{copy.required}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {canFilter ? (
              <div className="min-w-0 space-y-2">
                <Label htmlFor={filterId}>{copy.filterable}</Label>
                <OpsCheckboxFrame htmlFor={filterId}>
                  <Checkbox
                    id={filterId}
                    checked={filterable}
                    onCheckedChange={(checked) => setFilterable(checked === true)}
                  />
                </OpsCheckboxFrame>
              </div>
            ) : null}
            {showSpan ? (
              <div className="min-w-0 space-y-2">
                <Label htmlFor={spanId}>{copy.span}</Label>
                <Select value={String(span)} onValueChange={(next) => setSpan(clampFieldSpan(Number(next), groupColumns))}>
                  <SelectTrigger id={spanId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {spanChoices.map((choice) => (
                      <SelectItem key={choice} value={String(choice)}>
                        {choice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          {showSpan ? <p className="text-xs text-muted-foreground">{copy.spanHelp}</p> : null}
          {groups.length > 1 ? (
            <div className="min-w-0 max-w-md space-y-2">
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
                <SelectTrigger id={`ops-field-group-${field.id}`}>
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
          {field.locked || !fieldNeedsOptions(field.type) ? null : (
            <CommunityFieldsOptionsEditor
              idPrefix={`ops-field-opt-${field.id}`}
              rows={options}
              onChange={setOptions}
              copy={copy}
            />
          )}
          <div>
            <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>
              {copy.save}
            </Button>
          </div>
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
