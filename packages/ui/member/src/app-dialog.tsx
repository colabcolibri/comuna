'use client';

import type { ReactNode } from 'react';
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  ScrollArea,
} from '@community/ui';

const SIZE = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
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
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex max-h-[min(90svh,40rem)] w-full flex-col gap-0 overflow-hidden p-0',
          'top-auto bottom-0 translate-y-0 rounded-t-xl sm:top-[50%] sm:bottom-auto sm:translate-y-[-50%] sm:rounded-xl',
          SIZE[size]
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
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
    <header className="shrink-0 border-b border-border px-5 py-4 text-left sm:px-6">
      {children ?? (
        <>
          {title ? <DialogTitle className="tracking-tight text-foreground">{title}</DialogTitle> : null}
          {description ? (
            <DialogDescription className="mt-1 text-base">{description}</DialogDescription>
          ) : null}
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
