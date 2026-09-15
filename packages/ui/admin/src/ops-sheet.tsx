'use client';

import type { ReactNode } from 'react';
import {
  Button,
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
      <SheetContent side={side} className={className}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="grid min-h-0 flex-1 auto-rows-min gap-6 overflow-y-auto px-4">{children}</div>
        <SheetFooter>
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
