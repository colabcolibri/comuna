'use client';

import { Globe, Lock, Users } from 'lucide-react';
import { audiencePickerCeiling, type Exposure } from '@community/directory';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@community/ui';

const ICONS = { private: Lock, internal: Users, external: Globe };

export function AudienceMark({
  value,
  ceiling,
  labels,
  onChange,
  label,
}: {
  value: string;
  ceiling: Exposure | null;
  labels: Record<'private' | 'internal' | 'external', string>;
  onChange: (next: string) => void;
  label?: string;
}) {
  const cap = audiencePickerCeiling(ceiling);
  const options = (['private', 'internal', 'external'] as const).filter((item) => {
    if (cap === 'hidden') return item === 'private';
    if (cap === 'internal') return item !== 'external';
    return true;
  });
  return (
    <div className="flex min-w-0 flex-col items-end gap-1 sm:items-end">
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
      <TooltipProvider>
        <div role="group" aria-label={label} className="inline-flex shrink-0 items-center gap-1">
          {options.map((item) => {
            const Icon = ICONS[item];
            const selected = value === item;
            return (
              <Tooltip key={item}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={labels[item]}
                    className={`inline-flex size-9 min-h-9 min-w-9 items-center justify-center rounded-md border border-transparent ${selected ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'}`}
                    onClick={() => onChange(item)}
                  >
                    <Icon className="size-4" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{labels[item]}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
