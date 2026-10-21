'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, toast } from '@community/ui';
import { OpsAlertDialog, OpsBadge, OpsIconButton, OpsMoveButtons, OpsSheet } from '@community/ui-admin';
import { pickLocalizedText } from '@community/identity';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { fieldNeedsOptions, fieldTypeLabel, type CatalogCopy, type OpsField, type OpsGroup } from './community-fields-types';
import { CommunityFieldsManageOptions } from './community-fields-manage-options';

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
  groupColumns: number;
}) {
  const [open, setOpen] = useState(false);
  const [labelPt, setLabelPt] = useState(pickLocalizedText(field.label, 'pt-BR') || field.name);
  const [labelEn, setLabelEn] = useState(pickLocalizedText(field.label, 'en') || '');
  const [descriptionPt, setDescriptionPt] = useState(pickLocalizedText(field.description, 'pt-BR'));
  const [descriptionEn, setDescriptionEn] = useState(pickLocalizedText(field.description, 'en'));
  const [required, setRequired] = useState(field.required);
  const [localized, setLocalized] = useState(field.localized);
  const [busy, setBusy] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [exposure, setExposure] = useState(field.exposure);
  const english = locale === 'en';
  const requiredId = `ops-field-required-${field.id}`;
  const showOptions = !field.locked && fieldNeedsOptions(field.type);

  useEffect(() => {
    setLabelPt(pickLocalizedText(field.label, 'pt-BR') || field.name);
    setLabelEn(pickLocalizedText(field.label, 'en') || '');
    setDescriptionPt(pickLocalizedText(field.description, 'pt-BR'));
    setDescriptionEn(pickLocalizedText(field.description, 'en'));
    setRequired(field.required);
    setLocalized(field.localized);
    setExposure(field.exposure);
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
    let ok = true;
    if (!field.locked) {
      ok = await patchField({
        labelPt,
        labelEn,
        descriptionPt,
        descriptionEn,
      });
    } else {
      ok = await patchField({ descriptionPt, descriptionEn });
    }
    if (ok && required !== field.required) {
      ok = await patchField({ required });
    }
    if (ok && localized !== field.localized) {
      ok = await patchField({ localized });
    }
    if (ok && exposure !== field.exposure && exposure) {
      ok = await patchField({ exposure });
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

  return (
    <li className={field.locked ? 'min-w-0 rounded-md px-3 py-2.5' : 'min-w-0 rounded-md bg-muted/60 px-3 py-2.5'}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="text-sm font-medium wrap-break-word">
              {pickLocalizedText(field.label, locale) || field.name}
            </p>
            {field.locked ? <OpsBadge tone="fixed" title={copy.lockedHint}>{copy.locked}</OpsBadge> : <OpsBadge tone="added">{copy.added}</OpsBadge>}
            {field.enabled ? null : <OpsBadge tone="off">{copy.inactive}</OpsBadge>}
          </div>
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
            <OpsBadge>
              {fieldTypeLabel(field.type === 'localized_text' ? (field.name === 'bio' ? 'textarea' : 'text') : field.type, copy)}
            </OpsBadge>
            <OpsBadge tone={field.required ? 'required' : 'optional'}>{field.required ? copy.required : copy.optional}</OpsBadge>
            {field.localized || field.type === 'localized_text' ? <OpsBadge tone="locale">{copy.filledBoth}</OpsBadge> : null}
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <OpsMoveButtons
            moveUp={copy.moveUp}
            moveDown={copy.moveDown}
            canUp={index > 0}
            canDown={index < total - 1}
            onMove={onMove}
          />
          <OpsSheet
            open={open}
            onOpenChange={setOpen}
            className="sm:max-w-lg"
            trigger={
              <OpsIconButton label={copy.edit}>
                <Pencil />
              </OpsIconButton>
            }
            title={pickLocalizedText(field.label, locale) || field.name}
            description={field.locked ? copy.lockedHint : undefined}
            closeLabel={copy.cancel}
            footer={
              <Button type="button" disabled={busy} onClick={() => void save()}>
                {copy.save}
              </Button>
            }
          >
            {field.locked ? null : (
              <div className="min-w-0 space-y-2">
                <Label htmlFor={`ops-field-label-${field.id}`}>{english ? copy.labelEn : copy.labelPt}</Label>
                <Input
                  id={`ops-field-label-${field.id}`}
                  value={english ? labelEn : labelPt}
                  onChange={(ev) => (english ? setLabelEn(ev.target.value) : setLabelPt(ev.target.value))}
                />
              </div>
            )}
            <div className="grid min-w-0 gap-4">
              <div className="min-w-0 space-y-2">
                <Label htmlFor={`ops-field-desc-${field.id}`}>{english ? copy.descriptionEn : copy.descriptionPt}</Label>
                <Textarea
                  id={`ops-field-desc-${field.id}`}
                  value={english ? descriptionEn : descriptionPt}
                  onChange={(ev) => (english ? setDescriptionEn(ev.target.value) : setDescriptionPt(ev.target.value))}
                  required
                />
                <p className="text-xs text-muted-foreground">{copy.descriptionHelp}</p>
              </div>
              {translate ? (
                <>
                  {field.locked ? null : (
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor={`ops-field-label-other-${field.id}`}>{english ? copy.labelPt : copy.labelEn}</Label>
                      <Input
                        id={`ops-field-label-other-${field.id}`}
                        value={english ? labelPt : labelEn}
                        onChange={(ev) => (english ? setLabelPt(ev.target.value) : setLabelEn(ev.target.value))}
                      />
                    </div>
                  )}
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor={`ops-field-desc-other-${field.id}`}>{english ? copy.descriptionPt : copy.descriptionEn}</Label>
                    <Textarea
                      id={`ops-field-desc-other-${field.id}`}
                      value={english ? descriptionPt : descriptionEn}
                      onChange={(ev) => (english ? setDescriptionPt(ev.target.value) : setDescriptionEn(ev.target.value))}
                    />
                  </div>
                </>
              ) : (
                <Button type="button" variant="outline" onClick={() => setTranslate(true)}>
                  {copy.translate}
                </Button>
              )}
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label>{copy.type}</Label>
                <p className="flex h-11 items-center text-sm text-foreground">
                  {fieldTypeLabel(field.type === 'localized_text' ? (field.name === 'bio' ? 'textarea' : 'text') : field.type, copy)}
                </p>
              </div>
              <div className="min-w-0 space-y-2">
                <Label>{copy.name}</Label>
                <p className="flex min-h-11 items-center font-mono text-sm break-all">{field.name}</p>
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor={requiredId}>{copy.requirement}</Label>
                <Select value={required ? 'yes' : 'no'} onValueChange={(next) => setRequired(next === 'yes')}>
                  <SelectTrigger id={requiredId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">{copy.no}</SelectItem>
                    <SelectItem value="yes">{copy.yes}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {field.type === 'text' || field.type === 'textarea' || field.type === 'localized_text' ? (
                <div className="min-w-0 space-y-2">
                  <Label htmlFor={`ops-field-localized-${field.id}`}>{copy.localized}</Label>
                  <Select value={localized ? 'yes' : 'no'} onValueChange={(next) => setLocalized(next === 'yes')}>
                    <SelectTrigger id={`ops-field-localized-${field.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">{copy.no}</SelectItem>
                      <SelectItem value="yes">{copy.yes}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              {field.exposure ? (
                <div className="min-w-0 space-y-2">
                  <Label htmlFor={`ops-field-exposure-${field.id}`}>{copy.exposure}</Label>
                  <Select value={exposure || field.exposure} onValueChange={(next) => setExposure(next as OpsField['exposure'])}>
                    <SelectTrigger id={`ops-field-exposure-${field.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hidden">{copy.exposureHidden}</SelectItem>
                      <SelectItem value="internal">{copy.exposureInternal}</SelectItem>
                      <SelectItem value="external">{copy.exposureExternal}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
            {groups.length > 1 ? (
              <div className="min-w-0 space-y-2">
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
            {showOptions ? (
              <div className="min-w-0 space-y-3">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{copy.options}</p>
                  <CommunityFieldsManageOptions
                    communityId={communityId}
                    field={field}
                    copy={copy}
                    onChanged={onChanged}
                  />
                </div>
                <ul className="divide-y divide-border border-t border-border text-sm">
                  {(field.options || []).map((row) => (
                    <li key={row.value} className="flex min-w-0 items-center justify-between gap-3 py-2">
                      <span className="font-mono text-muted-foreground">{row.value}</span>
                      <span className="min-w-0 truncate">{pickLocalizedText(
                        [{ locale: 'pt-BR', value: row.labelPt }, { locale: 'en', value: row.labelEn }],
                        locale
                      )}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </OpsSheet>
          <OpsIconButton
            label={field.enabled ? copy.deactivate : copy.activate}
            onClick={() => void setEnabled(!field.enabled)}
          >
            {field.enabled ? <EyeOff /> : <Eye />}
          </OpsIconButton>
          {field.locked || field.enabled ? null : (
            <OpsIconButton label={copy.delete} onClick={() => setPendingDelete(true)}>
              <Trash2 />
            </OpsIconButton>
          )}
        </div>
      </div>
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
