'use client';

import { Button, Input, Label } from '@community/ui';
import { OpsMoveButtons } from '@community/ui-admin';
import type { CatalogCopy } from './community-fields-types';

export type OptionRow = {
  value: string;
  labelPt: string;
  labelEn: string;
};

export function emptyOptionRow(): OptionRow {
  return { value: '', labelPt: '', labelEn: '' };
}

export function CommunityFieldsOptionsEditor({
  idPrefix,
  rows,
  onChange,
  copy,
}: {
  idPrefix: string;
  rows: OptionRow[];
  onChange: (rows: OptionRow[]) => void;
  copy: CatalogCopy;
}) {
  const list = rows.length > 0 ? rows : [emptyOptionRow()];

  const patch = (index: number, next: Partial<OptionRow>) => {
    onChange(list.map((row, i) => (i === index ? { ...row, ...next } : row)));
  };

  const move = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) {
      return;
    }
    const copyRows = [...list];
    const [item] = copyRows.splice(index, 1);
    copyRows.splice(target, 0, item);
    onChange(copyRows);
  };

  return (
    <div className="space-y-3 min-w-0">
      <p className="text-sm font-medium">{copy.options}</p>
      <p className="text-xs text-muted-foreground">{copy.optionsHelp}</p>
      <ul className="space-y-3">
        {list.map((row, index) => (
          <li key={`${idPrefix}-${index}`} className="rounded-md border border-border p-3 min-w-0">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2 min-w-0">
                <Label htmlFor={`${idPrefix}-val-${index}`}>{copy.optionValue}</Label>
                <Input
                  id={`${idPrefix}-val-${index}`}
                  className="font-mono"
                  value={row.value}
                  onChange={(ev) => patch(index, { value: ev.target.value })}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor={`${idPrefix}-pt-${index}`}>{copy.labelPt}</Label>
                <Input
                  id={`${idPrefix}-pt-${index}`}
                  value={row.labelPt}
                  onChange={(ev) => patch(index, { labelPt: ev.target.value })}
                />
              </div>
              <div className="space-y-2 min-w-0">
                <Label htmlFor={`${idPrefix}-en-${index}`}>{copy.labelEn}</Label>
                <Input
                  id={`${idPrefix}-en-${index}`}
                  value={row.labelEn}
                  onChange={(ev) => patch(index, { labelEn: ev.target.value })}
                />
              </div>
            </div>
            <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
              <OpsMoveButtons
                moveUp={copy.moveUp}
                moveDown={copy.moveDown}
                canUp={index > 0}
                canDown={index < list.length - 1}
                onMove={(direction) => move(index, direction)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  onChange(list.length <= 1 ? [emptyOptionRow()] : list.filter((_, i) => i !== index))
                }
              >
                {copy.optionRemove}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...list, emptyOptionRow()])}>
        {copy.optionAdd}
      </Button>
    </div>
  );
}
