'use client';

import type { ReactNode } from 'react';
import { Button } from '@community/ui';
import { AppSheet } from './app-sheet';

export function AppFilterSheet({
  trigger,
  title,
  description,
  clearLabel,
  closeLabel,
  onClear,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  clearLabel: string;
  closeLabel: string;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <AppSheet
      trigger={trigger}
      title={title}
      description={description}
      closeLabel={closeLabel}
      footer={
        <Button type="button" onClick={onClear}>
          {clearLabel}
        </Button>
      }
    >
      {children}
    </AppSheet>
  );
}
