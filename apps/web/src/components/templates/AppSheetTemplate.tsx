import * as React from 'react';
import { ScrollArea, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@community/ui';

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
        <ScrollArea type="always" className="min-h-0 flex-1">
          <div className="px-4 pb-4">{content}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
