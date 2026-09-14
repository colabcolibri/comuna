import * as React from 'react';
import { Sheet } from '@community/ui';

export interface AppSheetTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  side?: 'left' | 'right';
  content: React.ReactNode;
}

export function AppSheetTemplate({ isOpen, onClose, title, description, side = 'right', content }: AppSheetTemplateProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={title} description={description} side={side}>
      {content}
    </Sheet>
  );
}
