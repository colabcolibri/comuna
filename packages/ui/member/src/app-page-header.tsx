import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function AppPageHeader({
  kicker,
  title,
  lede,
  actions,
  className,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <header className={cn('border-b border-border pb-8 mb-8', className)}>
      {kicker ? (
        <p className="text-sm font-medium text-primary tracking-wide mb-2">{kicker}</p>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-[1.75rem] sm:text-[2rem] leading-tight font-semibold tracking-tight text-foreground min-w-0">
          {title}
        </h1>
        {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
      </div>
      {lede ? <p className="mt-3 text-lg text-muted-foreground max-w-[40rem] leading-relaxed">{lede}</p> : null}
    </header>
  );
}
