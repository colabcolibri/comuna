import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function fieldSpanClass(span: 1 | 2 | 3, columns: 1 | 2 | 3) {
  const used = Math.min(span, columns);
  if (used >= 3) return 'col-span-1 md:col-span-3';
  if (used === 2) return 'col-span-1 md:col-span-2';
  return 'col-span-1';
}

export function fieldGridClass(columns: 1 | 2 | 3) {
  if (columns >= 3) return 'grid grid-cols-1 md:grid-cols-3 gap-4';
  if (columns === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-4';
  return 'grid grid-cols-1 gap-4';
}

export function FieldGrid({
  columns,
  children,
  className,
}: {
  columns: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(fieldGridClass(columns), 'min-w-0', className)}>{children}</div>;
}
