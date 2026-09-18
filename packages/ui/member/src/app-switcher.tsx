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
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 items-start justify-between gap-4', className)}>
      <div className="min-w-0 flex-1 space-y-1">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <Label htmlFor={id}>{label}</Label>
          {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
        </span>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        size={size}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}
