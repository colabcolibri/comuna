'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from '@community/ui';
import { OpsAccordion, OpsAlertDialog, OpsBadge, OpsIconButton, OpsMoveButtons } from '@community/ui-admin';
import { pickLocalizedText } from '@community/identity';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { CommunityFieldsCreateField } from './community-fields-create-field';
import { CommunityFieldsField } from './community-fields-field';
import { CommunityFieldsLayoutPreview } from './community-fields-layout-preview';
import type { CatalogCopy, OpsGroup } from './community-fields-types';

export function CommunityFieldsGroup({
  communityId,
  group,
  groups,
  index,
  total,
  locale,
  copy,
  onChanged,
}: {
  communityId: string;
  group: OpsGroup;
  groups: OpsGroup[];
  index: number;
  total: number;
  locale: string | undefined;
  copy: CatalogCopy;
  onChanged: () => void;
}) {
  const title = pickLocalizedText(group.label, locale) || group.slug;
  const [renaming, setRenaming] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [open, setOpen] = useState(false);
  const [labelPt, setLabelPt] = useState(pickLocalizedText(group.label, 'pt-BR') || group.slug);
  const [labelEn, setLabelEn] = useState(pickLocalizedText(group.label, 'en') || '');

  useEffect(() => {
    setLabelPt(pickLocalizedText(group.label, 'pt-BR') || group.slug);
    setLabelEn(pickLocalizedText(group.label, 'en') || '');
  }, [group.label, group.slug]);

  const saveLabel = async () => {
    const res = await fetch(`/api/admin/communities/${communityId}/groups/${group.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelPt, labelEn }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    setRenaming(false);
    onChanged();
  };
  const moveGroup = async (direction: 'up' | 'down') => {
    const res = await fetch(`/api/admin/communities/${communityId}/groups/${group.id}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    onChanged();
  };
  const moveField = async (fieldId: string, direction: 'up' | 'down') => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${fieldId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    onChanged();
  };
  const setColumns = async (columns: number) => {
    const res = await fetch(`/api/admin/communities/${communityId}/groups/${group.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columns }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
    onChanged();
  };
  const setEnabled = async (enabled: boolean) => {
    const res = await fetch(`/api/admin/communities/${communityId}/groups/${group.id}`, {
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
  const removeField = async (fieldId: string) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${fieldId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || copy.error);
      return;
    }
    toast.success(copy.saved);
    onChanged();
  };
  const removeGroup = async () => {
    const res = await fetch(`/api/admin/communities/${communityId}/groups/${group.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(res.status === 409 && data.error?.code === 'VALIDATION_ERROR' ? data.error.message || copy.groupNotEmpty : copy.error);
      return;
    }
    toast.success(copy.saved);
    onChanged();
  };
  const columnsId = `ops-group-columns-${group.id}`;

  return (
    <>
    <OpsAccordion
      value={group.id}
      title={title}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setRenaming(false);
        }
      }}
      badges={
        <>
          {group.locked ? <OpsBadge>{copy.locked}</OpsBadge> : null}
          {group.enabled ? null : <OpsBadge>{copy.inactive}</OpsBadge>}
        </>
      }
      actions={
        <>
          <CommunityFieldsLayoutPreview
            slug={group.slug}
            columns={group.columns}
            fields={group.fields}
            locale={locale}
            label={copy.layoutPreview}
            help={copy.layoutPreviewHelp}
            requiredLabel={copy.required}
            optionalLabel={copy.optional}
          />
          <CommunityFieldsCreateField
            communityId={communityId}
            groupId={group.id}
            copy={copy}
            onCreated={() => {
              setOpen(true);
              onChanged();
            }}
          />
          <OpsIconButton
            label={copy.rename}
            onClick={() => {
              setOpen(true);
              setRenaming((value) => !value);
            }}
          >
            <Pencil />
          </OpsIconButton>
          <OpsMoveButtons
            moveUp={copy.moveUp}
            moveDown={copy.moveDown}
            canUp={index > 0}
            canDown={index < total - 1}
            onMove={(direction) => void moveGroup(direction)}
          />
          <OpsIconButton
            label={group.enabled ? copy.deactivate : copy.activate}
            onClick={() => void setEnabled(!group.enabled)}
          >
            {group.enabled ? <EyeOff /> : <Eye />}
          </OpsIconButton>
          {group.locked || group.enabled ? null : (
            <OpsIconButton label={copy.delete} onClick={() => setPendingDelete(true)}>
              <Trash2 />
            </OpsIconButton>
          )}
        </>
      }
    >
      {renaming ? (
        <div className="mb-4 grid max-w-md gap-3">
          <div className="space-y-2">
            <Label htmlFor={`ops-group-pt-${group.id}`}>{copy.groupLabel}</Label>
            <Input
              id={`ops-group-pt-${group.id}`}
              value={labelPt}
              onChange={(ev) => setLabelPt(ev.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`ops-group-en-${group.id}`}>{copy.labelEn}</Label>
            <Input
              id={`ops-group-en-${group.id}`}
              value={labelEn}
              onChange={(ev) => setLabelEn(ev.target.value)}
            />
          </div>
          <div className="flex min-w-0 flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void saveLabel()}>
              {copy.save}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setLabelPt(pickLocalizedText(group.label, 'pt-BR') || group.slug);
                setLabelEn(pickLocalizedText(group.label, 'en') || '');
                setRenaming(false);
              }}
            >
              {copy.cancel}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="mt-3 max-w-md space-y-2">
        <Label htmlFor={columnsId}>{copy.columns}</Label>
        <Select value={String(group.columns)} onValueChange={(next) => void setColumns(Number(next))}>
          <SelectTrigger id={columnsId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{copy.columns1}</SelectItem>
            <SelectItem value="2">{copy.columns2}</SelectItem>
            <SelectItem value="3">{copy.columns3}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{copy.columnsHelp}</p>
      </div>
      <ol className="mt-4 divide-y divide-border border-t border-border">
        {group.fields.length === 0 ? (
          <li className="text-sm text-muted-foreground">{copy.empty}</li>
        ) : (
          group.fields.map((field, fieldIndex) => (
            <CommunityFieldsField
              key={field.id}
              communityId={communityId}
              field={field}
              index={fieldIndex}
              total={group.fields.length}
              locale={locale}
              copy={copy}
              onChanged={onChanged}
              groups={groups}
              currentGroupId={group.id}
              groupColumns={group.columns}
              onMove={(direction) => void moveField(field.id, direction)}
              onRemove={() => void removeField(field.id)}
            />
          ))
        )}
      </ol>
    </OpsAccordion>
    <OpsAlertDialog
        isOpen={pendingDelete}
        onClose={() => setPendingDelete(false)}
        title={copy.groupDeleteTitle}
        description={copy.groupDeleteBody}
        cancelLabel={copy.cancel}
        confirmLabel={copy.delete}
        confirmVariant="destructive"
        onConfirm={() => {
          setPendingDelete(false);
          void removeGroup();
        }}
      />
    </>
  );
}
