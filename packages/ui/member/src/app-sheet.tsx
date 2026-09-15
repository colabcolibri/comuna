'use client';

import type { ReactNode } from 'react';
import { cn, ScrollArea, Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@community/ui';

export type AppSheetSide = 'right' | 'bottom' | 'left';

export function AppSheet({
  open,
  onClose,
  side = 'right',
  title,
  description,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: AppSheetSide;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side={side}
        className={cn(
          'z-[60] flex flex-col gap-0 p-0',
          side === 'right' && 'w-full sm:max-w-md',
          side === 'left' && 'w-full sm:max-w-md',
          side === 'bottom' && 'max-h-[85svh]'
        )}
      >
        <SheetHeader className="shrink-0 border-b border-border">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <ScrollArea type="always" className="app-scroll min-h-0 flex-1">
          <div className="px-4 py-4">{children}</div>
        </ScrollArea>
        {footer ? <SheetFooter className="shrink-0 border-t border-border">{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}
