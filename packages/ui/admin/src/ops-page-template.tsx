import type { ReactNode } from 'react';
import { cn } from '@community/ui';
import { OpsPageHeader } from './ops-page-header';
import type { OpsLinkComponent } from './ops-link';

export function OpsPageTemplate({
  kicker,
  backHref,
  backLabel,
  backAriaLabel,
  title,
  subtitle,
  subtitleClassName,
  actions,
  nav,
  stickyHeader,
  children,
  className,
  linkComponent,
}: {
  kicker?: string;
  backHref?: string;
  backLabel?: string;
  backAriaLabel?: string;
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
  actions?: ReactNode;
  nav?: ReactNode;
  stickyHeader?: boolean;
  children?: ReactNode;
  className?: string;
  linkComponent?: OpsLinkComponent;
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
        linkComponent={linkComponent}
      />
      {nav}
      {children}
    </main>
  );
}
