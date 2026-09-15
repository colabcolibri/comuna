'use client';

import { Button, toast } from '@community/ui';
import { pickLocalizedText } from '@community/identity';
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

  return (
    <article className="min-w-0 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {copy.order} {index + 1}
          </p>
          <h3 className="text-base font-semibold break-words">{title}</h3>
          <p className="font-mono text-xs text-muted-foreground break-all">{group.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => void moveGroup('up')}>
            {copy.moveUp}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={index === total - 1} onClick={() => void moveGroup('down')}>
            {copy.moveDown}
          </Button>
          {group.locked ? (
            <span className="inline-flex items-center text-xs text-muted-foreground">{copy.locked}</span>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={() => void removeGroup()}>
              {copy.delete}
            </Button>
          )}
        </div>
      </div>
      <ol className="mt-4 space-y-2">
        {group.fields.length === 0 ? (
          <li className="text-sm text-muted-foreground">{copy.empty}</li>
        ) : (
          group.fields.map((field, fieldIndex) => (
            <li
              key={field.id}
              className="flex flex-col gap-2 rounded-md border border-border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium break-words">
                  {fieldIndex + 1}. {pickLocalizedText(field.label, locale) || field.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {field.name} · {field.type} · {field.storage}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={fieldIndex === 0}
                  onClick={() => void moveField(field.id, 'up')}
                >
                  {copy.moveUp}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={fieldIndex === group.fields.length - 1}
                  onClick={() => void moveField(field.id, 'down')}
                >
                  {copy.moveDown}
                </Button>
                {field.locked ? (
                  <span className="inline-flex items-center text-xs text-muted-foreground">{copy.locked}</span>
                ) : (
                  <Button type="button" size="sm" variant="outline" onClick={() => void removeField(field.id)}>
                    {copy.delete}
                  </Button>
                )}
              </div>
            </li>
          ))
        )}
      </ol>
    </article>
  );
}
