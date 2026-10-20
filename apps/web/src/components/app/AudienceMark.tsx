'use client';

import { Globe, Lock, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@community/ui';

const ICONS = { private: Lock, internal: Users, external: Globe };

export function AudienceMark({
  value,
  ceiling,
  labels,
  onChange,
}: {
  value: string;
  ceiling: 'hidden' | 'internal' | 'external' | null;
  labels: Record<'private' | 'internal' | 'external', string>;
  onChange: (next: string) => void;
}) {
  const options = (['private', 'internal', 'external'] as const).filter((item) => {
    if (!ceiling || ceiling === 'hidden') return item === 'private';
    if (ceiling === 'internal') return item !== 'external';
    return true;
  });
  return (
    <TooltipProvider>
      <div role="group" className="inline-flex shrink-0 items-center gap-1">
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
                  className={`inline-flex size-8 items-center justify-center rounded-md ${selected ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
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
  );
}
