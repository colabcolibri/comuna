'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { OpsIconButton } from './ops-icon-button';

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
      <OpsIconButton label={moveUp} disabled={!canUp} onClick={() => onMove('up')}>
        <ChevronUp />
      </OpsIconButton>
      <OpsIconButton label={moveDown} disabled={!canDown} onClick={() => onMove('down')}>
        <ChevronDown />
      </OpsIconButton>
    </div>
  );
}
