'use client';

import type { ReactNode } from 'react';
import {
  Button,
  cn,
  ScrollArea,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@community/ui';

export type OpsSheetSide = 'right' | 'bottom' | 'left';

export function OpsSheet({
  trigger,
  title,
  description,
  children,
  footer,
  closeLabel,
  side = 'right',
  open,
  onOpenChange,
  className,
}: {
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  side?: OpsSheetSide;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  return (
    <Sheet {...(typeof open === 'boolean' ? { open, onOpenChange } : {})}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className={cn('gap-0 overflow-hidden p-0', className)}>
        <SheetHeader className="shrink-0 border-b border-border">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <ScrollArea type="always" className="app-scroll app-sheet-scroll min-h-0 flex-1">
          <div className="grid auto-rows-min gap-6 px-4 py-4">{children}</div>
        </ScrollArea>
        <SheetFooter className="shrink-0 border-t border-border bg-card">
          {footer}
          {closeLabel ? (
            <SheetClose asChild>
              <Button type="button" variant="outline">
                {closeLabel}
              </Button>
            </SheetClose>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
