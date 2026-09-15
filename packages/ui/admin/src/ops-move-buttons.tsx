'use client';

import { Button } from '@community/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function OpsMoveButtons({
  moveUp,
  moveDown,
  canUp,
  canDown,
  onMove,
}: {
  moveUp: string;
  moveDown: string;
  canUp: boolean;
  canDown: boolean;
  onMove: (direction: 'up' | 'down') => void;
}) {
  return (
    <div className="flex gap-1">
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label={moveUp}
        disabled={!canUp}
        onClick={() => onMove('up')}
      >
        <ChevronUp />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label={moveDown}
        disabled={!canDown}
        onClick={() => onMove('down')}
      >
        <ChevronDown />
      </Button>
    </div>
  );
}
