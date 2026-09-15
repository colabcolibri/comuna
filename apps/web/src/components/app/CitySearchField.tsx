'use client';

import React, { useEffect, useState } from 'react';
import { Input, Label } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { MIN_CITY_QUERY, placeKey, placeLabel, toStoredPlace, type CitySearchHit, type GeoPlace } from '@community/places';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  search: 'city.search',
  empty: 'city.empty',
  clear: 'city.clear',
});

export function CitySearchField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: GeoPlace | null;
  onChange: (place: GeoPlace | null) => void;
}) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<CitySearchHit[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_CITY_QUERY) {
      setHits([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/places/cities?q=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((json) => setHits(json.data || []))
        .catch(() => setHits([]));
    }, 400);
    return () => clearTimeout(handle);
  }, [query]);

  const selected = placeLabel(value, locale);

  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor={id}>{label}</Label>
      {value ? (
        <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-md border border-input bg-transparent px-3">
          <p className="min-w-0 flex-1 truncate text-sm">{selected}</p>
          <button type="button" className="shrink-0 text-sm text-muted-foreground hover:text-foreground" onClick={() => onChange(null)}>
            {copy.clear}
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            id={id}
            value={query}
            autoComplete="off"
            placeholder={copy.search}
            className="min-h-11 w-full"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          {open && query.trim().length >= MIN_CITY_QUERY && (
            <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-surface border border-border rounded-lg text-sm">
              {hits.length === 0 && <li className="px-3 py-2 text-muted-foreground">{copy.empty}</li>}
              {hits.map((hit) => (
                <li key={placeKey(hit)}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-surface-container-low"
                    onClick={() => {
                      onChange(toStoredPlace(hit));
                      setQuery('');
                      setOpen(false);
                    }}
                  >
                    <span className="block font-medium">{placeLabel(hit, locale)}</span>
                    {hit.hint ? <span className="block text-muted-foreground break-words">{hit.hint}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
