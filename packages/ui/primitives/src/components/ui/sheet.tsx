import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  side?: 'left' | 'right';
  children?: React.ReactNode;
}

export function Sheet({ isOpen, onClose, title, description, side = 'right', children }: SheetProps) {
  if (!isOpen) return null;

  const sideClasses = side === 'left' ? 'left-0 border-r' : 'right-0 border-l';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <div className={cn('fixed inset-y-0 bg-card text-card-foreground w-full max-w-md p-6 shadow-xl border-border overflow-y-auto flex flex-col', sideClasses)}>
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg font-bold p-1">✕</button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
