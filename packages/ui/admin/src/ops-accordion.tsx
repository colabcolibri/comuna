'use client';

import { useState, type ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
} from '@community/ui';

export function OpsAccordion({
  value,
  title,
  badges,
  actions,
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  className,
}: {
  value: string;
  title: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isOpen = open ?? uncontrolled;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (open === undefined) {
      setUncontrolled(next);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={isOpen ? value : ''}
      onValueChange={(next) => setOpen(next === value)}
      className={cn('min-w-0 rounded-lg border border-border', className)}
    >
      <AccordionItem value={value} className="border-0">
        <div className="flex min-w-0 flex-col sm:flex-row sm:items-start">
          <AccordionTrigger className="min-w-0 flex-1 px-4 py-3 hover:no-underline">
            <span className="flex min-w-0 flex-wrap items-center gap-2 text-left">
              <span className="text-base font-semibold wrap-break-word">{title}</span>
              {badges}
            </span>
          </AccordionTrigger>
          {actions ? (
            <div className="flex min-w-0 flex-wrap items-center gap-2 px-4 pb-3 sm:justify-end sm:py-3 sm:pl-0">
              {actions}
            </div>
          ) : null}
        </div>
        <AccordionContent className="px-4 pb-4">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
