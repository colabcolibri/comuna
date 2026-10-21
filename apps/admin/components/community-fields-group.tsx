'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@community/ui';
import { OpsAlertDialog, OpsBadge, OpsDialog, OpsDialogBody, OpsDialogHeader } from '@community/ui-admin';
import { pickLocalizedText } from '@community/identity';
import { MoreHorizontal } from 'lucide-react';
import { CommunityFieldsCreateField } from './community-fields-create-field';
import { CommunityFieldsField } from './community-fields-field';
import { CommunityFieldsLayoutPreview } from './community-fields-layout-preview';
import { clampFieldSpan, type CatalogCopy, type OpsGroup } from './community-fields-types';

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
  const english = locale === 'en';
  const [renaming, setRenaming] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [labelPt, setLabelPt] = useState(pickLocalizedText(group.label, 'pt-BR') || group.slug);
  const [labelEn, setLabelEn] = useState(pickLocalizedText(group.label, 'en') || '');
  const [translate, setTranslate] = useState(false);

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
    setTranslate(false);
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
  const setFieldSpan = async (fieldId: string, span: number) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${fieldId}`, {
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
  const primaryLabel = english ? labelEn : labelPt;
  const setPrimaryLabel = (value: string) => {
    if (english) {
      setLabelEn(value);
      return;
    }
    setLabelPt(value);
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 text-sm font-semibold wrap-break-word">{title}</h3>
          {group.locked ? <OpsBadge tone="fixed" title={copy.lockedHint}>{copy.locked}</OpsBadge> : null}
          {group.enabled ? null : <OpsBadge tone="off">{copy.inactive}</OpsBadge>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="icon-sm" aria-label={copy.actions}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setRenaming(true)}>{copy.rename}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOrganizing(true)}>{copy.organize}</DropdownMenuItem>
            <DropdownMenuItem disabled={index === 0} onSelect={() => void moveGroup('up')}>
              {copy.moveUp}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={index >= total - 1} onSelect={() => void moveGroup('down')}>
              {copy.moveDown}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void setEnabled(!group.enabled)}>
              {group.enabled ? copy.deactivate : copy.activate}
            </DropdownMenuItem>
            {group.locked || group.enabled ? null : (
              <DropdownMenuItem onSelect={() => setPendingDelete(true)}>{copy.delete}</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ol className="flex flex-col gap-1 p-4">
        {group.fields.length === 0 ? (
          <li className="px-3 py-2 text-sm text-muted-foreground">{copy.empty}</li>
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
      <div className="border-t border-border px-4 py-3">
        <CommunityFieldsCreateField
          communityId={communityId}
          groupId={group.id}
          locale={locale}
          copy={copy}
          onCreated={onChanged}
        />
      </div>

      <OpsDialog open={renaming} onClose={() => setRenaming(false)}>
        <OpsDialogHeader title={copy.rename} />
        <OpsDialogBody>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor={`ops-group-name-${group.id}`}>{english ? copy.labelEn : copy.labelPt}</Label>
              <Input
                id={`ops-group-name-${group.id}`}
                value={primaryLabel}
                onChange={(ev) => setPrimaryLabel(ev.target.value)}
              />
            </div>
            {translate ? (
              <div className="space-y-2">
                <Label htmlFor={`ops-group-other-${group.id}`}>{english ? copy.labelPt : copy.labelEn}</Label>
                <Input
                  id={`ops-group-other-${group.id}`}
                  value={english ? labelPt : labelEn}
                  onChange={(ev) => (english ? setLabelPt(ev.target.value) : setLabelEn(ev.target.value))}
                />
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setTranslate(true)}>
                {copy.translate}
              </Button>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void saveLabel()}>
                {copy.save}
              </Button>
              <Button type="button" variant="outline" onClick={() => setRenaming(false)}>
                {copy.cancel}
              </Button>
            </div>
          </div>
        </OpsDialogBody>
      </OpsDialog>

      <OpsDialog open={organizing} onClose={() => setOrganizing(false)} size="lg">
        <OpsDialogHeader title={copy.organize} description={title} />
        <OpsDialogBody>
          <div className="grid gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0 max-w-md flex-1 space-y-2">
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
            </div>
            {group.columns > 1 && group.fields.length > 0 ? (
              <ul className="divide-y divide-border border-t border-border">
                {group.fields.map((field) => (
                  <li key={field.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="min-w-0 text-sm wrap-break-word">{pickLocalizedText(field.label, locale) || field.name}</p>
                    <div className="w-full min-w-0 sm:w-40">
                      <Label className="sr-only" htmlFor={`ops-span-${field.id}`}>
                        {copy.span}
                      </Label>
                      <Select
                        value={String(clampFieldSpan(field.span, group.columns))}
                        onValueChange={(next) => void setFieldSpan(field.id, clampFieldSpan(Number(next), group.columns))}
                      >
                        <SelectTrigger id={`ops-span-${field.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: group.columns }, (_, i) => i + 1).map((choice) => (
                            <SelectItem key={choice} value={String(choice)}>
                              {choice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </OpsDialogBody>
      </OpsDialog>

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
    </section>
  );
}
