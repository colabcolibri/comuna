'use client';

import { useEffect, useState } from 'react';
import { Button, toast } from '@community/ui';
import { OpsAlertDialog, OpsSheet } from '@community/ui-admin';
import { interpolate } from '@community/identity';
import type { ChoiceOptionChange } from '@community/directory/ops';
import type { CatalogCopy, OpsField } from './community-fields-types';
import { CommunityFieldsOptionsEditor, emptyOptionRow, type OptionRow } from './community-fields-options';

type PreviewResponse = {
  safe: boolean;
  changes: ChoiceOptionChange[];
  totalAffected: number;
  usage: Record<string, number>;
};

export function CommunityFieldsManageOptions({
  communityId,
  field,
  copy,
  onChanged,
}: {
  communityId: string;
  field: OpsField;
  copy: CatalogCopy;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<OptionRow[]>(field.options?.length ? field.options : [emptyOptionRow()]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<PreviewResponse | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setRows(field.options?.length ? field.options : [emptyOptionRow()]);
    void loadUsage(field.options || []);
  }, [field, open]);

  async function loadUsage(options: OptionRow[]) {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ options }),
    });
    if (!res.ok) {
      return;
    }
    const body = (await res.json()) as { data?: PreviewResponse };
    setUsage(body.data?.usage || {});
  }

  async function previewSave(): Promise<PreviewResponse | null> {
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ options: rows }),
    });
    if (!res.ok) {
      toast.error(copy.error);
      return null;
    }
    const body = (await res.json()) as { data: PreviewResponse };
    return body.data;
  }

  async function applyOptions(acknowledged: string[]) {
    setBusy(true);
    const res = await fetch(`/api/admin/communities/${communityId}/fields/${field.id}/options`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applyDataMigration: true,
        options: rows,
        acknowledged,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(copy.error);
      return false;
    }
    toast.success(copy.saved);
    setPendingPreview(null);
    setOpen(false);
    onChanged();
    return true;
  }

  async function save() {
    setBusy(true);
    const preview = await previewSave();
    setBusy(false);
    if (!preview) {
      return;
    }
    if (preview.safe) {
      await applyOptions([]);
      return;
    }
    setPendingPreview(preview);
  }

  const lockedValues = new Set(Object.entries(usage).filter(([, count]) => count > 0).map(([value]) => value));

  const impactLines = (pendingPreview?.changes || [])
    .filter((change) => change.requiresMigration)
    .map((change) => {
      if (change.kind === 'rename') {
        return interpolate(copy.optionsImpactRename, {
          from: change.from || '',
          to: change.to || '',
          count: String(change.count),
        });
      }
      return interpolate(copy.optionsImpactRemove, {
        value: change.value,
        count: String(change.count),
      });
    });

  return (
    <>
      <OpsSheet
        open={open}
        onOpenChange={setOpen}
        className="sm:max-w-lg"
        trigger={
          <Button type="button" size="sm" variant="outline">
            {copy.manageOptions}
          </Button>
        }
        title={copy.manageOptionsTitle}
        description={copy.manageOptionsHelp}
        closeLabel={copy.cancel}
        footer={
          <Button type="button" disabled={busy} onClick={() => void save()}>
            {copy.save}
          </Button>
        }
      >
        <CommunityFieldsOptionsEditor
          idPrefix={`ops-manage-opt-${field.id}`}
          rows={rows}
          onChange={setRows}
          copy={copy}
          lockedValues={lockedValues}
        />
      </OpsSheet>
      <OpsAlertDialog
        isOpen={pendingPreview !== null}
        onClose={() => setPendingPreview(null)}
        title={copy.optionsImpactTitle}
        description={
          pendingPreview
            ? `${copy.optionsImpactBody}\n${impactLines.join('\n')}\n${interpolate(copy.optionsImpactTotal, {
                total: String(pendingPreview.totalAffected),
              })}`
            : ''
        }
        cancelLabel={copy.cancel}
        confirmLabel={copy.optionsImpactConfirm}
        confirmVariant="destructive"
        onConfirm={() => {
          if (!pendingPreview) {
            return;
          }
          const keys = pendingPreview.changes
            .filter((change) => change.requiresMigration)
            .map((change) => (change.kind === 'rename' ? change.from || change.value : change.value));
          void applyOptions(keys);
        }}
      />
    </>
  );
}
