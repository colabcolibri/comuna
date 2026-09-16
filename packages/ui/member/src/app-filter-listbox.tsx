'use client';

import { useId } from 'react';
import { Checkbox, Label, ScrollArea, cn } from '@community/ui';

export type AppFilterListboxOption = {
  value: string;
  label: string;
};

export function AppFilterListbox({
  label,
  options,
  selected,
  onChange,
  className,
}: {
  label: string;
  options: AppFilterListboxOption[];
  selected: ReadonlySet<string> | string[];
  onChange: (next: string[]) => void;
  className?: string;
}) {
  const labelId = useId();
  const picked = selected instanceof Set ? selected : new Set(selected);

  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <Label id={labelId} className="text-sm font-medium">
        {label}
      </Label>
      <ScrollArea type="always" className="app-scroll app-filter-listbox-scroll rounded-md border border-border bg-card">
        <ul role="listbox" aria-labelledby={labelId} aria-multiselectable="true" className="p-1">
          {options.map((option) => {
            const checked = picked.has(option.value);
            return (
              <li key={option.value} role="presentation">
                <label
                  className="flex min-h-10 cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted/60"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => {
                      const values = new Set(picked);
                      if (next === true) {
                        values.add(option.value);
                      } else {
                        values.delete(option.value);
                      }
                      onChange([...values]);
                    }}
                  />
                  <span className="min-w-0 flex-1">{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
