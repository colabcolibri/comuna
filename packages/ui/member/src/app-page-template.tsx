import type { ReactNode } from 'react';
import { cn } from '@community/ui';
import { AppPageHeader } from './app-page-header';

export function AppPageTemplate({
  kicker,
  title,
  subtitle,
  actions,
  stickyHeader,
  children,
  className,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
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
      <AppPageHeader kicker={kicker} title={title} lede={subtitle} actions={actions} sticky={stickyHeader} />
      {children}
    </main>
  );
}
