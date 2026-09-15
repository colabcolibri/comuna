import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function AppProfileStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('divide-y divide-border min-w-0', className)}>{children}</div>;
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
    <section className="min-w-0 py-8 first:pt-0">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 text-base text-muted-foreground max-w-[40rem] leading-relaxed">{description}</p>
      ) : null}
      <div className="mt-6 min-w-0">{children}</div>
    </section>
  );
}

export function AppFormDock({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-2 flex justify-end border-t border-border bg-background/95 px-4 py-3 sm:hidden supports-[backdrop-filter]:bg-background/80">
      {children}
    </div>
  );
}
