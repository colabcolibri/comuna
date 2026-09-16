import type { ReactNode } from 'react';
import {
  Label,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@community/ui';

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

export function AppShowcaseEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-border bg-card px-5 py-10 sm:px-8 sm:py-14"
    >
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p>
    </div>
  );
}

export function AppShowcasePager({
  page,
  pageSize,
  total,
  prevLabel,
  nextLabel,
  summary,
  sizeLabel,
  sizes,
  onPage,
  onPageSize,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  prevLabel: string;
  nextLabel: string;
  summary: string;
  sizeLabel: string;
  sizes: readonly number[];
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  className?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) {
    return null;
  }
  const canPrev = page > 1;
  const canNext = page < pages;
  return (
    <div className={`flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`}>
      <p className="text-sm text-muted-foreground">{summary}</p>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Label className="sr-only">{sizeLabel}</Label>
        <Select value={String(pageSize)} onValueChange={(next) => onPageSize(Number(next))}>
          <SelectTrigger className="min-h-11 w-auto min-w-28" aria-label={sizeLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Pagination className="mx-0 w-auto justify-end" aria-label={summary}>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                size="default"
                href="#"
                aria-label={prevLabel}
                aria-disabled={!canPrev}
                className={`min-h-11 px-4 ${canPrev ? '' : 'pointer-events-none opacity-50'}`}
                onClick={(event) => {
                  event.preventDefault();
                  if (canPrev) {
                    onPage(page - 1);
                  }
                }}
              >
                {prevLabel}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink size="icon" isActive href="#" className="min-h-11 min-w-11" onClick={(event) => event.preventDefault()}>
                {page}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                size="default"
                href="#"
                aria-label={nextLabel}
                aria-disabled={!canNext}
                className={`min-h-11 px-4 ${canNext ? '' : 'pointer-events-none opacity-50'}`}
                onClick={(event) => {
                  event.preventDefault();
                  if (canNext) {
                    onPage(page + 1);
                  }
                }}
              >
                {nextLabel}
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
