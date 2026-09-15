'use client';

import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from '@community/ui';
import { OpsBadge, OpsMoveButtons } from '@community/ui-admin';
import { pickLocalizedText } from '@community/identity';
import { CommunityFieldsField } from './community-fields-field';
import type { CatalogCopy, OpsGroup } from './community-fields-types';

export function CommunityFieldsGroup({
  communityId,
  group,
  index,
  total,
  locale,
  copy,
  onChanged,
}: {
  communityId: string;
  group: OpsGroup;
  index: number;
  total: number;
  locale: string | undefined;
  copy: CatalogCopy;
  onChanged: () => void;
}) {
  const title = pickLocalizedText(group.label, locale) || group.slug;
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
    onChanged();
  };
  const removeField = async (fieldId: string) => {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${fieldId}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    onChanged();
  };
  const removeGroup = async () => {
    const res = await fetch(`/api/admin/communities/${communityId}/groups/${group.id}`, { method: 'DELETE' });
    if (res.status === 409) {
      toast.error(copy.groupNotEmpty);
      return;
    }
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    onChanged();
  };
  const columnsId = `ops-group-columns-${group.id}`;

  return (
    <article className="min-w-0 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold break-words">{title}</h3>
            {group.locked ? <OpsBadge>{copy.locked}</OpsBadge> : null}
          </div>
          <p className="font-mono text-xs text-muted-foreground break-all">{group.slug}</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <OpsMoveButtons
            moveUp={copy.moveUp}
            moveDown={copy.moveDown}
            canUp={index > 0}
            canDown={index < total - 1}
            onMove={(direction) => void moveGroup(direction)}
          />
          {group.locked ? null : (
            <Button type="button" size="sm" variant="outline" onClick={() => void removeGroup()}>
              {copy.delete}
            </Button>
          )}
        </div>
      </div>
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
      <ol className="mt-4 space-y-2">
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
              onMove={(direction) => void moveField(field.id, direction)}
              onRemove={() => void removeField(field.id)}
            />
          ))
        )}
      </ol>
    </article>
  );
}
