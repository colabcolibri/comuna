'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger, cn } from '@community/ui';

export type OpsTabItem = {
  value: string;
  label: string;
};

export function OpsTabs({
  value,
  onValueChange,
  items,
  ariaLabel,
  orientation = 'horizontal',
  variant = 'line',
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: OpsTabItem[];
  ariaLabel: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'line';
  className?: string;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn('w-full min-w-0', className)}
    >
      <TabsList
        variant={variant}
        aria-label={ariaLabel}
        className={cn(
          orientation === 'vertical'
            ? 'h-auto w-full max-w-56 items-stretch'
            : 'h-auto min-h-9 w-full max-w-full flex-wrap justify-start'
        )}
      >
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="max-w-full flex-none">
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={`${item.value}-panel`} value={item.value} className="hidden" />
      ))}
    </Tabs>
  );
}
