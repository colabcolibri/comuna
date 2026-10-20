'use client';

import type { ReactNode } from 'react';
import { Label, Switch, cn } from '@community/ui';

export function AppSwitcher({
  id,
  label,
  description,
  status,
  checked,
  onCheckedChange,
  disabled,
  size = 'default',
  end,
  className,
}: {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
  end?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 items-start justify-between gap-6', className)}>
      <div className="min-w-0 flex-1 space-y-1">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <Label htmlFor={id} className="text-lg font-semibold leading-none text-foreground">
            {label}
          </Label>
          {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
        </span>
        {description ? <p className="text-base leading-snug text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          size={size}
          className="shrink-0"
        />
        {end}
      </div>
    </div>
  );
}
