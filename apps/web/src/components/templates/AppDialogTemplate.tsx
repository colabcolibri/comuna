import type { ReactNode } from 'react';
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogHeader } from '@community/ui-member';

export function AppDialogTemplate({
  isOpen,
  onClose,
  title,
  description,
  content,
  actions,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  content: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  return (
    <AppDialog open={isOpen} onClose={onClose} size={size}>
      <AppDialogHeader title={title} description={description} />
      <AppDialogBody>{content}</AppDialogBody>
      {actions ? <AppDialogFooter>{actions}</AppDialogFooter> : null}
    </AppDialog>
  );
}
