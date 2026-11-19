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
  const pinSave = Boolean(stickyHeader && actions);

  return (
    <main
      className={cn(
        'flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10',
        pinSave && 'sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-4',
        className
      )}
    >
      <AppPageHeader
        kicker={kicker}
        title={title}
        lede={subtitle}
        actions={pinSave ? undefined : actions}
      />
      {pinSave ? (
        <div className="sticky top-0 z-20 mb-8 flex justify-end bg-background pt-2 py-3 sm:mb-0 sm:mt-7 sm:pb-0">
          {actions}
        </div>
      ) : null}
      {children ? (
        <div className={cn('min-w-0 overflow-x-hidden', pinSave && 'sm:col-span-2')}>{children}</div>
      ) : null}
    </main>
  );
}
