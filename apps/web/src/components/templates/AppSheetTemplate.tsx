import * as React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@community/ui';

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
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side={side} className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{title ?? 'Painel'}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">{content}</div>
      </SheetContent>
    </Sheet>
  );
}
