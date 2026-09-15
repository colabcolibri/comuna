'use client';

import type { ReactNode } from 'react';
import { cn, ScrollArea } from '@community/ui';

const SIZE = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

export type AppDialogSize = keyof typeof SIZE;

export function AppDialog({
  open,
  onClose,
  size = 'md',
  children,
}: {
  open: boolean;
  onClose: () => void;
  size?: AppDialogSize;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 flex max-h-[min(90svh,40rem)] w-full flex-col overflow-hidden rounded-t-xl border border-border bg-card text-card-foreground sm:rounded-xl',
          SIZE[size]
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AppDialogHeader({
  title,
  description,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
      {children ?? (
        <>
          {title ? <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2> : null}
          {description ? <p className="mt-1 text-base text-muted-foreground">{description}</p> : null}
        </>
      )}
    </header>
  );
}

export function AppDialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ScrollArea type="always" className={cn('app-scroll min-h-0 flex-1', className)}>
      <div className="px-5 py-4 sm:px-6">{children}</div>
    </ScrollArea>
  );
}

export function AppDialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer
      className={cn(
        'flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-card px-5 py-3 sm:flex-row sm:justify-end sm:px-6',
        className
      )}
    >
      {children}
    </footer>
  );
}
