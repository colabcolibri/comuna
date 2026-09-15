import type { ReactNode } from 'react';
import { Button, cn } from '@community/ui';

export function OpsPageHeader({
  kicker,
  backHref,
  backLabel,
  backAriaLabel,
  title,
  lede,
  ledeClassName,
  actions,
  sticky,
  className,
}: {
  kicker?: string;
  backHref?: string;
  backLabel?: string;
  backAriaLabel?: string;
  title: string;
  lede?: string;
  ledeClassName?: string;
  actions?: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  const back = backHref && backLabel ? (
    <Button variant="outline" size="sm" className="mb-4" asChild>
      <a href={backHref} aria-label={backAriaLabel ?? backLabel}>
        {backLabel}
      </a>
    </Button>
  ) : null;

  const kickerNode = kicker ? (
    <p className="text-sm font-medium text-primary tracking-wide">{kicker}</p>
  ) : null;

  const bar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        {kickerNode}
        <h1 className="text-[1.75rem] sm:text-[2rem] leading-tight font-semibold tracking-tight text-foreground break-words">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );

  const ledeNode = lede ? (
    <p className={cn('text-base text-muted-foreground max-w-[40rem] leading-relaxed', ledeClassName)}>{lede}</p>
  ) : null;

  if (sticky) {
    return (
      <div className={className}>
        <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-border bg-background/95 px-4 py-4 sm:-mx-6 sm:px-6 supports-[backdrop-filter]:bg-background/80">
          {back}
          {bar}
        </div>
        {ledeNode ? <div className="mb-8">{ledeNode}</div> : null}
      </div>
    );
  }

  return (
    <header className={cn('border-b border-border pb-8 mb-8', className)}>
      {back}
      {kickerNode ? <div className="mb-2">{kickerNode}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-[1.75rem] sm:text-[2rem] leading-tight font-semibold tracking-tight text-foreground min-w-0 break-words">
          {title}
        </h1>
        {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
      </div>
      {ledeNode ? <div className="mt-3">{ledeNode}</div> : null}
    </header>
  );
}
