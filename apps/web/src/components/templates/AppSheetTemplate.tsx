import type { ReactNode } from 'react';
import { AppSheet, type AppSheetSide } from '@community/ui-member';

export function AppSheetTemplate({
  isOpen,
  onClose,
  title,
  description,
  side = 'right',
  content,
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  side?: AppSheetSide;
  content: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <AppSheet open={isOpen} onClose={onClose} side={side} title={title ?? 'Painel'} description={description} footer={footer}>
      {content}
    </AppSheet>
  );
}
