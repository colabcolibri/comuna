import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function personInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function AppIndexList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden divide-y divide-border', className)}>
      {children}
    </div>
  );
}

export function AppPersonRow({
  name,
  headline,
  status,
  action,
}: {
  name: string;
  headline?: string | null;
  status?: string | null;
  action?: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-3 sm:flex-row sm:items-center px-4 py-4 sm:px-5 min-w-0">
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium"
        aria-hidden
      >
        {personInitials(name)}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-foreground truncate">{name}</h2>
        {headline ? <p className="text-base text-muted-foreground mt-0.5 line-clamp-2">{headline}</p> : null}
      </div>
      {status ? (
        <span className="inline-flex w-fit text-sm px-2.5 py-1 rounded-md border border-border bg-secondary text-foreground">
          {status}
        </span>
      ) : null}
      {action ? <div className="shrink-0">{action}</div> : null}
    </article>
  );
}
