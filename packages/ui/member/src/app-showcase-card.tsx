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
  talentLine?: string | null;
  summary?: string | null;
  languagesLabel?: string;
  languages?: string[];
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
  talentLine,
  summary,
  languagesLabel,
  languages,
  facts,
  actionLabel,
  onOpen,
}: AppPersonCardProps) {
  const compact = variant === 'compact';
  const mark = personInitials(name);
  const photoClass = compact ? 'size-14 text-base' : 'size-16 text-lg';
  const spoken = compact ? languages?.slice(0, 3) : languages;
  const meta = [
    ...(spoken && spoken.length > 0 ? [{ label: compact ? '' : languagesLabel || '', values: spoken }] : []),
    ...(!compact && facts ? facts : []),
  ].filter((item) => item.label || item.values.length > 0);

  return (
    <article className="min-w-0">
      <button
        type="button"
        aria-label={`${actionLabel}: ${name}`}
        onClick={onOpen}
        className="flex h-full min-w-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-xs transition-colors hover:border-foreground/20 hover:bg-accent/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <div className="flex min-w-0 items-start gap-4">
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
          <div className="min-w-0 flex-1">
            <span className="flex min-w-0 items-start justify-between gap-3">
              <h2 className="min-w-0 text-lg font-semibold leading-snug tracking-tight text-foreground">{name}</h2>
              <span aria-hidden className="mt-1 shrink-0 text-muted-foreground">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </span>
            </span>
            {headline ? (
              <p className={`mt-1 text-base leading-snug text-foreground ${compact ? 'line-clamp-2' : ''}`}>{headline}</p>
            ) : null}
            {city ? <p className="mt-1 truncate text-sm text-muted-foreground">{city}</p> : null}
          </div>
        </div>
        {!compact && (summary || talentLine) ? (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {summary ? <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">{summary}</p> : null}
            {talentLine ? <p className="truncate text-sm text-foreground">{talentLine}</p> : null}
          </div>
        ) : null}
        {meta.length > 0 ? (
          <div className="mt-4 flex min-w-0 flex-col gap-3 border-t border-border pt-4">
            {meta.map((item) => (
              <AppPersonFieldGroup key={item.label || item.values[0]} label={item.label} values={item.values} />
            ))}
          </div>
        ) : null}
      </button>
    </article>
  );
}

export function AppShowcaseCard(props: Omit<AppPersonCardProps, 'variant'>) {
  return <AppPersonCard variant="teaser" {...props} />;
}
