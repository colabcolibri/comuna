import type { ReactNode } from 'react';
import { personInitials } from './app-person-row';

export function AppShowcaseGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function AppShowcaseCard({
  name,
  photoUrl,
  headline,
  city,
  summary,
  chips,
  actionLabel,
  onOpen,
}: {
  name: string;
  photoUrl?: string | null;
  headline?: string | null;
  city?: string | null;
  summary?: string | null;
  chips?: string[];
  actionLabel: string;
  onOpen: () => void;
}) {
  const mark = personInitials(name);
  return (
    <article className="min-w-0">
      <button
        type="button"
        aria-label={`${actionLabel}: ${name}`}
        onClick={onOpen}
        className="relative flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xs transition-colors hover:border-foreground/20 hover:bg-accent/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span aria-hidden className="pointer-events-none absolute top-4 right-4 text-muted-foreground">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </span>
        <div className="flex min-w-0 items-start gap-4 p-5 pb-0 pr-12">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="size-20 shrink-0 rounded-full object-cover" />
          ) : (
            <div
              className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-medium text-primary-foreground"
              aria-hidden
            >
              {mark}
            </div>
          )}
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">{name}</h2>
            {city ? <p className="mt-1 truncate text-sm text-muted-foreground">{city}</p> : null}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          {headline ? <p className="text-base font-medium leading-snug text-foreground">{headline}</p> : null}
          {summary ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
          ) : null}
          {chips && chips.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {chips.slice(0, 3).map((chip) => (
                <li
                  key={chip}
                  className="inline-flex rounded-md border border-border bg-secondary px-2.5 py-1 text-sm text-foreground"
                >
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </button>
    </article>
  );
}
