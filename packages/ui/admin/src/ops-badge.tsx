import type { ReactNode } from 'react';
import { cn } from '@community/ui';

const TONE = {
  neutral: 'border-border bg-secondary text-foreground',
  required: 'border-transparent bg-primary text-primary-foreground',
  optional: 'border-border bg-transparent text-muted-foreground',
  off: 'border-transparent bg-destructive/15 text-destructive',
  added: 'border-transparent bg-foreground text-background',
  fixed: 'border-transparent bg-muted text-muted-foreground',
  locale: 'border-primary/40 bg-primary/10 text-primary',
} as const;

export function OpsBadge({
  children,
  className,
  title,
  tone = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: keyof typeof TONE;
}) {
  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-wide',
        TONE[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
