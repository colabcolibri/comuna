'use client';

import { useEffect, useState } from 'react';
import { Button } from '@community/ui';

export const PEOPLE_MAP_HEIGHTS = ['sm', 'md', 'lg', 'xl'] as const;
export type PeopleMapHeight = (typeof PEOPLE_MAP_HEIGHTS)[number];
export const DEFAULT_PEOPLE_MAP_HEIGHT: PeopleMapHeight = 'md';
const STORAGE_KEY = 'people-map-height';

export function parsePeopleMapHeight(raw: string | null | undefined): PeopleMapHeight {
  return (PEOPLE_MAP_HEIGHTS as readonly string[]).includes(raw || '')
    ? (raw as PeopleMapHeight)
    : DEFAULT_PEOPLE_MAP_HEIGHT;
}

export function usePeopleMapHeight() {
  const [size, setSize] = useState<PeopleMapHeight>(DEFAULT_PEOPLE_MAP_HEIGHT);

  useEffect(() => {
    setSize(parsePeopleMapHeight(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  function update(next: PeopleMapHeight) {
    setSize(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return [size, update] as const;
}

export function PeopleMapHeightControl({
  size,
  label,
  labels,
  onChange,
}: {
  size: PeopleMapHeight;
  label: string;
  labels: Record<PeopleMapHeight, string>;
  onChange: (next: PeopleMapHeight) => void;
}) {
  return (
    <div className="mb-2 flex min-w-0 flex-wrap items-center justify-end gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex min-w-0 rounded-md border border-input p-0.5">
        {PEOPLE_MAP_HEIGHTS.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={size === value ? 'secondary' : 'ghost'}
            aria-pressed={size === value}
            className="shrink-0 px-2.5"
            onClick={() => onChange(value)}
          >
            {labels[value]}
          </Button>
        ))}
      </div>
    </div>
  );
}
