'use client';

import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@community/ui';

export const OpsIconButton = forwardRef<
  HTMLButtonElement,
  Omit<ComponentProps<typeof Button>, 'size' | 'children'> & {
    label: string;
    children: ReactNode;
  }
>(function OpsIconButton({ label, children, variant = 'outline', type = 'button', ...props }, ref) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} type={type} size="icon-sm" variant={variant} aria-label={label} {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
