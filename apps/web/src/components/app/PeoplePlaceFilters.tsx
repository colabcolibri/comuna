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
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider } from '@community/ui';

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
        <Label htmlFor={`${id}-radius`} className="mb-2 block">
          {radiusLabel}
          <span className="ml-2 font-normal text-muted-foreground">{formatListRadiusKm(draft, locale)}</span>
        </Label>
        <Slider
          id={`${id}-radius`}
          min={LIST_RADIUS_MIN_KM}
          max={LIST_RADIUS_MAX_KM}
          step={LIST_RADIUS_STEP_KM}
          value={[draft]}
          disabled={!value.near}
          aria-label={radiusLabel}
          className="mt-4"
          onValueChange={(next) => setDraft(next[0] ?? DEFAULT_LIST_RADIUS_KM)}
          onValueCommit={(next) => onChange({ ...value, radius: next[0] ?? DEFAULT_LIST_RADIUS_KM })}
        />
      </div>
    </div>
  );
}
