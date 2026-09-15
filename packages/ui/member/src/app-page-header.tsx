import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function AppPageHeader({
  kicker,
  title,
  lede,
  actions,
  sticky,
  className,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  const bar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {kicker ? <p className="text-sm font-medium text-primary tracking-wide">{kicker}</p> : null}
        <h1 className="text-[1.75rem] sm:text-[2rem] leading-tight font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );

  if (sticky) {
    return (
      <div className={className}>
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-border bg-background/95 px-4 py-4 sm:-mx-6 sm:px-6 supports-[backdrop-filter]:bg-background/80">
          {bar}
        </div>
        {lede ? <p className="mb-8 text-base text-muted-foreground max-w-[40rem] leading-relaxed">{lede}</p> : null}
      </div>
    );
  }

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
