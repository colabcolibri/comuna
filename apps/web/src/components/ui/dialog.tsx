import * as React from 'react';
import { cn } from '@/lib/utils';

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
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        {(title || description) && (
          <div className="p-6 border-b border-slate-100">
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
        )}
        <div className="p-6">{children}</div>
        {actions && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
