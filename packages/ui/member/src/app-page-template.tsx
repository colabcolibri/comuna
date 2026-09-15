import type { ReactNode } from 'react';
import { cn } from '@community/ui';
import { AppPageHeader } from './app-page-header';

export function AppPageTemplate({
  kicker,
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn('flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 overflow-x-hidden', className)}>
      <AppPageHeader kicker={kicker} title={title} lede={subtitle} actions={actions} />
      {children}
    </main>
  );
}
