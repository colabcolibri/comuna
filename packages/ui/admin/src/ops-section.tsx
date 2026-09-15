import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function OpsSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('min-w-0 rounded-xl border border-border bg-card p-6 shadow-sm', className)}>
      <h2 className="text-xl font-semibold leading-tight tracking-tight text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 text-base text-muted-foreground max-w-[40rem] leading-relaxed">{description}</p>
      ) : null}
      <div className="mt-6 min-w-0">{children}</div>
    </section>
  );
}
