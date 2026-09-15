import type { ReactNode } from 'react';
import { cn } from '@community/ui';

export function OpsCheckboxFrame({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-transparent shadow-xs dark:bg-input/30',
        className
      )}
    >
      {children}
    </label>
  );
}
