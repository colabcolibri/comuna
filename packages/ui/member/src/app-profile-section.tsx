import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function AppProfileStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-w-0 flex-col gap-12 pb-16', className)}>{children}</div>;
}

export function AppProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-base leading-relaxed text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function AppProfileItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0 rounded-xl border border-border bg-card px-4 py-4 sm:px-5', className)}>{children}</div>
  );
}

export function AppFormDock({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-2 flex justify-end border-t border-border bg-background/95 px-4 py-3 sm:hidden supports-[backdrop-filter]:bg-background/80">
      {children}
    </div>
  );
}
