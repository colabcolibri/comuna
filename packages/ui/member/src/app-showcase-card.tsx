import type { ReactNode } from 'react';
import { personInitials } from './app-person-row';

export function AppShowcaseGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function AppShowcaseCard({
  name,
  photoUrl,
  headline,
  city,
  summary,
  chips,
  action,
}: {
  name: string;
  photoUrl?: string | null;
  headline?: string | null;
  city?: string | null;
  summary?: string | null;
  chips?: string[];
  action?: ReactNode;
}) {
  const mark = personInitials(name);
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex min-w-0 items-start gap-4">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="size-16 shrink-0 rounded-full object-cover" />
        ) : (
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground"
            aria-hidden
          >
            {mark}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-foreground">{name}</h2>
          {city ? <p className="mt-1 truncate text-sm text-muted-foreground">{city}</p> : null}
        </div>
      </div>
      {headline ? <p className="text-base font-medium text-foreground">{headline}</p> : null}
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
      {action ? <div className="mt-auto">{action}</div> : null}
    </article>
  );
}
