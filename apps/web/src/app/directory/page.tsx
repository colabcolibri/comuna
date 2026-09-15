'use client';

import React, { useEffect, useState } from 'react';
import { contentFromCatalog, pickContent, pickLocalizedText } from '@community/identity';
import { displayPlaceLocality } from '@community/places';
import type { CatalogField } from '@community/directory';
import { AppIndexList, AppPageTemplate, AppPersonRow } from '@community/ui-member';
import { Checkbox } from '@community/ui';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';
import { availabilityLabel } from '@/lib/people/availability';

const CONTENT = contentFromCatalog(uiCatalog, 'plugin_directory', {
  kicker: 'page.kicker',
  title: 'page.title',
  subtitle: 'page.subtitle',
  search: 'page.search',
  empty: 'page.empty',
  privacy: 'page.privacy',
  view: 'page.view',
  facets: 'page.facets',
  hire: 'card.hire',
  partner: 'card.partner',
  mentor: 'card.mentor',
  unavailable: 'card.unavailable',
});

type MemberRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  current_city: unknown;
  languages: unknown;
  headline: unknown;
  bio: unknown;
  availability_status: string | null;
};

export default function DirectoryPage() {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [facets, setFacets] = useState<CatalogField[]>([]);
  const [facetValues, setFacetValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/directory/catalog').then(async (res) => {
      if (res.status === 401) {
        window.location.replace('/login');
        return;
      }
      if (res.status === 404) {
        window.location.replace('/');
        return;
      }
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      const fields = (json.groups || []).flatMap((group: { fields?: CatalogField[] }) => group.fields || []);
      setFacets(fields.filter((field: CatalogField) => field.filterable && field.storage === 'attributes'));
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    Object.entries(facetValues).forEach(([name, value]) => {
      if (value) {
        params.set(`attr.${name}`, value);
      }
    });
    const query = params.toString();
    fetch(`/api/directory/members${query ? `?${query}` : ''}`).then(async (res) => {
      if (res.status === 401) {
        window.location.replace('/login');
        return;
      }
      if (res.status === 404) {
        window.location.replace('/');
        return;
      }
      if (!res.ok) {
        setRows([]);
        return;
      }
      const json = await res.json();
      setRows(json.data || []);
    });
  }, [searchTerm, facetValues]);

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <label className="block text-sm font-medium mb-2" htmlFor="global-search">
        {copy.search}
      </label>
      <input
        id="global-search"
        className="w-full min-h-11 px-4 py-2.5 bg-card border border-border rounded-lg mb-6"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {facets.length > 0 && (
        <fieldset className="mb-6 space-y-2">
          <legend className="text-sm font-medium">{copy.facets}</legend>
          {facets.map((field) => (
            <label key={field.name} className="flex items-center gap-2 min-h-11 text-sm">
              <Checkbox
                checked={facetValues[field.name] === 'true'}
                onChange={(e) =>
                  setFacetValues((current) => ({
                    ...current,
                    [field.name]: e.target.checked ? 'true' : '',
                  }))
                }
              />
              {pickLocalizedText(field.label, locale) || field.name}
            </label>
          ))}
        </fieldset>
      )}
      <p className="text-base text-muted-foreground mb-6 max-w-[40rem]">{copy.privacy}</p>
      {rows.length === 0 && <p className="text-muted-foreground">{copy.empty}</p>}
      {rows.length > 0 && (
        <AppIndexList>
          {rows.map((profile) => {
            const headline = pickLocalizedText(profile.headline, locale);
            const city = displayPlaceLocality(profile.current_city, locale);
            return (
              <AppPersonRow
                key={profile.id}
                name={profile.full_name}
                photo={profile.avatar_url}
                headline={[headline, city].filter(Boolean).join(' · ')}
                status={availabilityLabel(profile.availability_status, copy)}
              />
            );
          })}
        </AppIndexList>
      )}
    </AppPageTemplate>
  );
}
