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

export type AppSheetSide = 'right' | 'bottom' | 'left';

export function AppSheet({
  trigger,
  title,
  description,
  children,
  footer,
  closeLabel,
  side = 'right',
  open,
  onOpenChange,
}: {
  trigger: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  side?: AppSheetSide;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Sheet {...(typeof open === 'boolean' ? { open, onOpenChange } : {})}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">{children}</div>
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
