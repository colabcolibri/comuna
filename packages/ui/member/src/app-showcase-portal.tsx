import type { ReactNode } from 'react';
import { Button } from '@community/ui';

export function AppShowcasePortal({
  title,
  lede,
  actions,
  toolbar,
  children,
}: {
  title: string;
  lede?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <main className="w-full min-w-0 flex-1 overflow-x-hidden">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              {lede ? (
                <p className="mt-5 max-w-[42rem] text-lg leading-relaxed text-muted-foreground sm:text-xl">{lede}</p>
              ) : null}
            </div>
            {actions ? <div className="w-full shrink-0 sm:w-auto">{actions}</div> : null}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {toolbar}
        {children}
      </div>
    </main>
  );
}

export function AppShowcasePager({
  page,
  pageSize,
  total,
  prevLabel,
  nextLabel,
  summary,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  prevLabel: string;
  nextLabel: string;
  summary: string;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) {
    return null;
  }
  return (
    <nav className="mt-10 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label={summary}>
      <p className="text-sm text-muted-foreground">{summary}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="min-h-11" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          {prevLabel}
        </Button>
        <Button type="button" variant="outline" className="min-h-11" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          {nextLabel}
        </Button>
      </div>
    </nav>
  );
}
