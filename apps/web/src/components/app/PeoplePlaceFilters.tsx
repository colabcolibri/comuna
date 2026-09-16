'use client';

import { useEffect, useState } from 'react';
import { CitySearchField } from '@/components/app/CitySearchField';
import {
  DEFAULT_LIST_RADIUS_KM,
  LIST_RADIUS_MAX_KM,
  LIST_RADIUS_MIN_KM,
  LIST_RADIUS_STEP_KM,
  countryName,
  formatListRadiusKm,
  legacyPlaceFromNear,
  placeLabel,
  placeLatLon,
  type GeoPlace,
  type PlaceLocale,
} from '@community/places';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  cn,
} from '@community/ui';

export type PlaceFilterValue = {
  country: string;
  near: string;
  radius?: number;
  nearLabel: string;
};

export function PeoplePlaceFilters({
  id,
  locale,
  countries,
  value,
  allCountriesLabel,
  countryLabel,
  cityLabel,
  radiusLabel,
  onChange,
}: {
  id: string;
  locale: PlaceLocale;
  countries: string[];
  value: PlaceFilterValue;
  allCountriesLabel: string;
  countryLabel: string;
  cityLabel: string;
  radiusLabel: string;
  onChange: (next: PlaceFilterValue) => void;
}) {
  const selected = legacyPlaceFromNear(value.near, value.nearLabel, value.country);
  const radius = value.radius ?? DEFAULT_LIST_RADIUS_KM;
  const [draft, setDraft] = useState(radius);
  const codes = countries.includes(value.country) || !value.country ? countries : [value.country, ...countries];

  useEffect(() => {
    setDraft(radius);
  }, [radius]);

  const canRadius = Boolean(value.near);

  function applyPlace(place: GeoPlace | null) {
    const coords = placeLatLon(place);
    if (!place || !coords) {
      onChange({ ...value, near: '', nearLabel: '', radius: undefined });
      return;
    }
    onChange({
      ...value,
      near: `${coords.lat},${coords.lon}`,
      nearLabel: placeLabel(place, locale),
      radius: value.radius ?? DEFAULT_LIST_RADIUS_KM,
    });
  }

  function applyRadius(next: number) {
    const km = Math.min(LIST_RADIUS_MAX_KM, Math.max(LIST_RADIUS_MIN_KM, next));
    setDraft(km);
    onChange({ ...value, radius: km });
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="min-w-0">
        <Label htmlFor={`${id}-country`} className="mb-2 block">
          {countryLabel}
        </Label>
        <Select
          value={value.country || 'all'}
          onValueChange={(next) => onChange({ ...value, country: next === 'all' ? '' : next })}
        >
          <SelectTrigger id={`${id}-country`} className="min-h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{allCountriesLabel}</SelectItem>
            {codes.map((code) => (
              <SelectItem key={code} value={code}>
                {countryName(code, locale) || code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CitySearchField id={`${id}-city`} label={cityLabel} value={selected} onChange={applyPlace} />
      <div className="min-w-0">
        <Label className="mb-2 block">{radiusLabel}</Label>
        <InputGroup
          className={cn('h-11 min-h-11', !canRadius && 'pointer-events-none cursor-not-allowed opacity-50')}
          data-disabled={!canRadius || undefined}
          aria-disabled={!canRadius}
        >
          <InputGroupAddon align="inline-start" className="gap-0 pr-1 pl-1">
            <InputGroupButton
              size="icon-xs"
              aria-label={`${radiusLabel} -${LIST_RADIUS_STEP_KM}`}
              disabled={!canRadius || draft <= LIST_RADIUS_MIN_KM}
              onClick={() => applyRadius(draft - LIST_RADIUS_STEP_KM)}
            >
              <ChevronLeftIcon />
            </InputGroupButton>
            <InputGroupButton
              size="icon-xs"
              aria-label={`${radiusLabel} +${LIST_RADIUS_STEP_KM}`}
              disabled={!canRadius || draft >= LIST_RADIUS_MAX_KM}
              onClick={() => applyRadius(draft + LIST_RADIUS_STEP_KM)}
            >
              <ChevronRightIcon />
            </InputGroupButton>
          </InputGroupAddon>
          <Slider
            min={LIST_RADIUS_MIN_KM}
            max={LIST_RADIUS_MAX_KM}
            step={LIST_RADIUS_STEP_KM}
            value={[draft]}
            disabled={!canRadius}
            aria-label={radiusLabel}
            data-slot="input-group-control"
            className="min-w-0 flex-1 px-2"
            onValueChange={(next) => setDraft(next[0] ?? DEFAULT_LIST_RADIUS_KM)}
            onValueCommit={(next) => applyRadius(next[0] ?? DEFAULT_LIST_RADIUS_KM)}
          />
          <InputGroupText className="shrink-0 justify-end whitespace-nowrap pr-3 tabular-nums">
            {formatListRadiusKm(draft, locale)}
          </InputGroupText>
        </InputGroup>
      </div>
    </div>
  );
}
