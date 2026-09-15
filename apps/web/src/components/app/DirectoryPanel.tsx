'use client';

import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { useLocale } from '@/components/app/LocaleProvider';
import { PersonInspect } from '@/components/app/PersonInspect';
import { uiCatalog } from '@/lang/catalog';
import { availabilityLabel } from '@/lib/people/availability';
import { directoryQueryString } from '@/lib/people/directory-query';
import type { PersonCard } from '@/lib/people/person-card';
import { useDebouncedValue } from '@/lib/people/use-debounced-value';
import { slotOn } from '@/modules/registry';
import type { CatalogField } from '@community/directory';
import { contentFromCatalog, mergeContent, pickContent, pickLocalizedText } from '@community/identity';
import { displayPlaceLocality } from '@community/places';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { Button, Checkbox, Input } from '@community/ui';
import { AppIndexList, AppPageTemplate, AppPersonRow } from '@community/ui-member';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CONTENT = mergeContent(
  mergeContent(
    contentFromCatalog(uiCatalog, 'plugin_directory', {
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
    }),
    contentFromCatalog(uiCatalog, 'plugin_showcase', {
      close: 'page.close',
      langPt: 'lang.pt',
      langEn: 'lang.en',
      langEs: 'lang.es',
      langFr: 'lang.fr',
      host: 'host.yes',
      linkedin: 'link.linkedin',
      github: 'link.github',
      portfolio: 'link.portfolio',
    })
  ),
  contentFromCatalog(uiCatalog, 'plugin_contact_mediated', {
    contact: 'form.contact',
    cancel: 'form.cancel',
    send: 'form.send',
    success: 'form.success',
    email: 'form.email',
    message: 'form.message',
  })
);

export function DirectoryPanel({
  rows,
  facets,
  search,
  facetValues,
}: {
  rows: PersonCard[];
  facets: CatalogField[];
  search: string;
  facetValues: Record<string, string>;
}) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const enabled = useEnabledModules();
  const canContact = slotOn(enabled, SHOWCASE_ROW_ACTION);
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<PersonCard | null>(null);
  const [term, setTerm] = useState(search);
  const debounced = useDebouncedValue(term, 300);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  useEffect(() => {
    const query = directoryQueryString(debounced, facetValues);
    const next = query ? `${pathname}?${query}` : pathname;
    const committed = directoryQueryString(search, facetValues);
    const committedPath = committed ? `${pathname}?${committed}` : pathname;
    if (next === committedPath) {
      return;
    }
    router.replace(next, { scroll: false });
  }, [debounced, facetValues, pathname, search, router]);

  function go(nextSearch: string, nextFacets: Record<string, string>) {
    const query = directoryQueryString(nextSearch, nextFacets);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <label className="block text-sm font-medium mb-2" htmlFor="global-search">
        {copy.search}
      </label>
      <Input
        id="global-search"
        className="mb-6 min-h-11"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      {facets.length > 0 && (
        <fieldset className="mb-6 space-y-2">
          <legend className="text-sm font-medium">{copy.facets}</legend>
          {facets.map((field) => (
            <label key={field.name} className="flex items-center gap-2 min-h-11 text-sm">
              <Checkbox
                checked={facetValues[field.name] === 'true'}
                onCheckedChange={(checked) =>
                  go(search, {
                    ...facetValues,
                    [field.name]: checked === true ? 'true' : '',
                  })
                }
              />
              {pickLocalizedText(field.label, locale) || field.name}
            </label>
          ))}
        </fieldset>
      )}
      <p className="text-base text-muted-foreground mb-6 max-w-160">{copy.privacy}</p>
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
                action={
                  <Button variant="outline" className="min-h-11 w-full sm:w-auto" onClick={() => setSelected(profile)}>
                    {copy.view}
                  </Button>
                }
              />
            );
          })}
        </AppIndexList>
      )}
      <PersonInspect
        profile={selected}
        copy={copy}
        locale={locale}
        canContact={canContact}
        onClose={() => setSelected(null)}
      />
    </AppPageTemplate>
  );
}
