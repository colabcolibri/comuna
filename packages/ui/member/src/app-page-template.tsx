import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function AppPageTemplate({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn('flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-10 overflow-x-hidden', className)}>
      <header className="mb-8">
        <h1 className="text-[32px] leading-10 font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-2 text-lg text-muted-foreground max-w-3xl">{subtitle}</p> : null}
      </header>
      {children}
    </main>
  );
}
