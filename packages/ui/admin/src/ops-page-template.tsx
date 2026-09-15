import type { ReactNode } from 'react';
import { cn } from '@community/ui';
import { OpsPageHeader } from './ops-page-header';

export function OpsPageTemplate({
  kicker,
  backHref,
  backLabel,
  backAriaLabel,
  title,
  subtitle,
  subtitleClassName,
  actions,
  stickyHeader,
  children,
  className,
}: {
  kicker?: string;
  backHref?: string;
  backLabel?: string;
  backAriaLabel?: string;
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
  actions?: ReactNode;
  stickyHeader?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        'flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 overflow-x-hidden',
        stickyHeader ? 'pb-8 sm:pb-10' : 'py-8 sm:py-10',
        className
      )}
    >
      <OpsPageHeader
        kicker={kicker}
        backHref={backHref}
        backLabel={backLabel}
        backAriaLabel={backAriaLabel}
        title={title}
        lede={subtitle}
        ledeClassName={subtitleClassName}
        actions={actions}
        sticky={stickyHeader}
      />
      {children}
    </main>
  );
}
