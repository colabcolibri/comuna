import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';

export interface AppDialogTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode;
}

export function AppDialogTemplate({ isOpen, onClose, title, description, content, actions }: AppDialogTemplateProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} description={description} actions={actions}>
      {content}
    </Dialog>
  );
}
