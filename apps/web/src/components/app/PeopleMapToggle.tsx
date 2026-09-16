'use client';

import { Button } from '@community/ui';
import { List, Map } from 'lucide-react';

export function PeopleMapToggle({
  mapView,
  mapLabel,
  listLabel,
  onChange,
}: {
  mapView: boolean;
  mapLabel: string;
  listLabel: string;
  onChange: (mapView: boolean) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 w-full shrink-0 sm:w-auto"
      onClick={() => onChange(!mapView)}
    >
      {mapView ? <List className="size-4" /> : <Map className="size-4" />}
      {mapView ? listLabel : mapLabel}
    </Button>
  );
}
