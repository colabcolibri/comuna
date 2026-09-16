'use client';

import { CitySearchField } from '@/components/app/CitySearchField';
import { DEFAULT_LIST_RADIUS_KM, LIST_RADIUS_KM, countryName, formatListRadiusKm, legacyPlaceFromNear, placeLabel, placeLatLon, type GeoPlace, type PlaceLocale } from '@community/places';
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@community/ui';

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
  const codes = countries.includes(value.country) || !value.country ? countries : [value.country, ...countries];

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
        </Label>
        <Select
          value={String(radius)}
          disabled={!value.near}
          onValueChange={(next) => onChange({ ...value, radius: Number.parseInt(next, 10) })}
        >
          <SelectTrigger id={`${id}-radius`} className="min-h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIST_RADIUS_KM.map((km) => (
              <SelectItem key={km} value={String(km)}>
                {formatListRadiusKm(km, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
