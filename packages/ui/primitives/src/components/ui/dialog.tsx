import * as React from 'react';
import { cn } from '../../lib/utils';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, description, children, actions }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border w-full max-w-lg overflow-hidden">
        {(title || description) && (
          <div className="p-6 border-b border-border">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        <div className="p-6">{children}</div>
        {actions && (
          <div className="p-4 bg-muted border-t border-border flex justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
