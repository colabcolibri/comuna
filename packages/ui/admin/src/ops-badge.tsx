import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function OpsBadge({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-wide text-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}
