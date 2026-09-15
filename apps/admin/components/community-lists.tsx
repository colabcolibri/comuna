'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Checkbox, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from '@community/ui';
import { OpsCheckboxFrame, OpsSection } from '@community/ui-admin';
import { contentFromCatalog, pickContent, pickLocalizedText, type LocalizedText } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.lists',
  help: 'community.lists_help',
  directory: 'community.lists_directory',
  showcase: 'community.lists_showcase',
  filter: 'community.lists_filter',
  placement: 'community.lists_placement',
  off: 'community.lists_off',
  detail: 'community.lists_detail',
  card: 'community.lists_card',
  save: 'community.save',
  saved: 'community.fields_saved',
  error: 'community.save_error',
});

type ListRow = {
  fieldId: string;
  name: string;
  type: string;
  label: LocalizedText;
  canFilter: boolean;
  filterable: boolean;
  placement: 'off' | 'detail' | 'card';
  placementLocked: boolean;
};

export function CommunityLists({ communityId, listKey }: { communityId: string; listKey: 'directory' | 'showcase' }) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [rows, setRows] = useState<ListRow[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/communities/${communityId}/lists/${listKey}`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  }, [communityId, listKey]);

  const save = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/lists/${listKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: rows.map((row) => ({ fieldId: row.fieldId, filterable: row.filterable, placement: row.placement })),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(copy.error);
      return;
    }
    toast.success(copy.saved);
  };

  const base = `/communities/${communityId}/lists`;

  return (
    <OpsSection title={copy.title} description={copy.help}>
      <div className="mb-6 flex min-w-0 flex-wrap gap-2">
        <Button asChild variant={listKey === 'directory' ? 'default' : 'outline'} className="min-h-11">
          <Link href={`${base}/directory`}>{copy.directory}</Link>
        </Button>
        <Button asChild variant={listKey === 'showcase' ? 'default' : 'outline'} className="min-h-11">
          <Link href={`${base}/showcase`}>{copy.showcase}</Link>
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => {
          const filterId = `list-filter-${row.fieldId}`;
          const placeId = `list-place-${row.fieldId}`;
          return (
            <li key={row.fieldId} className="grid min-w-0 gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(11rem,14rem)] sm:items-center">
              <p className="min-w-0 text-sm font-medium wrap-break-word">{pickLocalizedText(row.label, locale) || row.name}</p>
              {row.canFilter ? (
                <div className="min-w-0">
                  <Label htmlFor={filterId} className="sr-only">
                    {copy.filter}
                  </Label>
                  <OpsCheckboxFrame htmlFor={filterId}>
                    <Checkbox
                      id={filterId}
                      checked={row.filterable}
                      onCheckedChange={(checked) =>
                        setRows((current) =>
                          current.map((item) => (item.fieldId === row.fieldId ? { ...item, filterable: checked === true } : item))
                        )
                      }
                    />
                    <span className="text-sm">{copy.filter}</span>
                  </OpsCheckboxFrame>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">{copy.filter}</span>
              )}
              <div className="min-w-0">
                <Label htmlFor={placeId} className="sr-only">
                  {copy.placement}
                </Label>
                <Select
                  value={row.placement}
                  disabled={row.placementLocked}
                  onValueChange={(next) =>
                    setRows((current) =>
                      current.map((item) =>
                        item.fieldId === row.fieldId ? { ...item, placement: next as ListRow['placement'] } : item
                      )
                    )
                  }
                >
                  <SelectTrigger id={placeId} className="min-h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">{copy.off}</SelectItem>
                    <SelectItem value="detail">{copy.detail}</SelectItem>
                    <SelectItem value="card">{copy.card}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6">
        <Button type="button" disabled={busy} className="min-h-11" onClick={() => void save()}>
          {copy.save}
        </Button>
      </div>
    </OpsSection>
  );
}
