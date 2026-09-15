import type { ReactNode } from 'react';
import { personInitials } from './app-person-row';
import { AppPersonFieldGroup } from './app-person-field-group';

export type AppPersonCardVariant = 'compact' | 'teaser';

export function AppShowcaseGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

type AppPersonCardProps = {
  variant?: AppPersonCardVariant;
  name: string;
  photoUrl?: string | null;
  headline?: string | null;
  city?: string | null;
  summary?: string | null;
  languagesLabel?: string;
  languages?: string[];
  availabilityLabel?: string;
  availability?: string | null;
  facts?: { label: string; values: string[] }[];
  actionLabel: string;
  onOpen: () => void;
};

export function AppPersonCard({
  variant = 'teaser',
  name,
  photoUrl,
  headline,
  city,
  summary,
  languagesLabel,
  languages,
  availabilityLabel,
  availability,
  facts,
  actionLabel,
  onOpen,
}: AppPersonCardProps) {
  const compact = variant === 'compact';
  const mark = personInitials(name);
  const photoClass = compact ? 'size-16 text-lg' : 'size-20 text-xl';
  const spoken = compact ? languages?.slice(0, 3) : languages;
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
            <img src={photoUrl} alt="" className={`${photoClass} shrink-0 rounded-full object-cover`} />
          ) : (
            <div
              className={`flex ${photoClass} shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground`}
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
          {headline ? (
            <p className={`text-base font-medium leading-snug text-foreground ${compact ? 'line-clamp-2' : ''}`}>{headline}</p>
          ) : null}
          {!compact && summary ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
          ) : null}
          {compact ? (
            <>
              {spoken && spoken.length > 0 ? <AppPersonFieldGroup label="" values={spoken} /> : null}
              {availability ? (
                <span className="inline-flex w-fit rounded-md border border-border bg-secondary px-2.5 py-1 text-sm text-foreground">
                  {availability}
                </span>
              ) : null}
            </>
          ) : (
            <>
              {spoken && spoken.length > 0 ? (
                <AppPersonFieldGroup label={languagesLabel || ''} values={spoken} />
              ) : null}
              {availability ? (
                <AppPersonFieldGroup label={availabilityLabel || ''} values={[availability]} />
              ) : null}
              {facts?.map((item) => (
                <AppPersonFieldGroup key={item.label} label={item.label} values={item.values} />
              ))}
            </>
          )}
        </div>
      </button>
    </article>
  );
}

export function AppShowcaseCard(props: Omit<AppPersonCardProps, 'variant'>) {
  return <AppPersonCard variant="teaser" {...props} />;
}
