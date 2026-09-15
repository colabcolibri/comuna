'use client';

import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { useLocale } from '@/components/app/LocaleProvider';
import { PeopleCohortSelect, PeopleFilters } from '@/components/app/PeopleFilters';
import { PersonInspect } from '@/components/app/PersonInspect';
import { uiCatalog } from '@/lang/catalog';
import { availabilityLabel } from '@/lib/people/availability';
import { activeFilterCount, directoryQueryString } from '@/lib/people/directory-query';
import type { PersonCard } from '@/lib/people/person-card';
import { useDebouncedValue } from '@/lib/people/use-debounced-value';
import { slotOn } from '@/modules/registry';
import type { CatalogField, ListField } from '@community/directory';
import { availabilityIsFilterable, projectPersonView } from '@community/directory';
import { contentFromCatalog, mergeContent, pickContent } from '@community/identity';
import { displayPlaceLocality } from '@community/places';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { Button, Input } from '@community/ui';
import { AppFilterSheet, AppIndexList, AppPageTemplate, AppPersonRow } from '@community/ui-member';
import { ListFilter } from 'lucide-react';
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
      close: 'page.close',
      filters: 'page.filters',
      filtersClear: 'page.filters_clear',
      filtersHint: 'page.filters_hint',
      languages: 'page.languages',
      all: 'page.all',
      cohort: 'page.cohort',
      hire: 'card.hire',
      partner: 'card.partner',
      mentor: 'card.mentor',
      unavailable: 'card.unavailable',
      availability: 'card.availability',
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
    sending: 'form.sending',
    success: 'form.success',
    name: 'form.name',
    email: 'form.email',
    phone: 'form.phone',
    message: 'form.message',
    requiredMissing: 'form.required_missing',
    messageMin: 'form.message_min',
    privacy: 'form.privacy',
  })
);

export function DirectoryPanel({
  rows,
  facets,
  listFields = [],
  search,
  facetValues,
  cohorts,
  cohort,
  status = '',
}: {
  rows: PersonCard[];
  facets: CatalogField[];
  listFields?: ListField[];
  search: string;
  facetValues: Record<string, string>;
  cohorts: { id: string; name: string }[];
  cohort: string;
  status?: string;
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
  const count = activeFilterCount(facetValues, [status]);
  const canFilter = facets.length > 0 || availabilityIsFilterable(listFields);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  useEffect(() => {
    const query = directoryQueryString(debounced, facetValues, cohort, status);
    const next = query ? `${pathname}?${query}` : pathname;
    const committed = directoryQueryString(search, facetValues, cohort, status);
    const committedPath = committed ? `${pathname}?${committed}` : pathname;
    if (next === committedPath) {
      return;
    }
    router.replace(next, { scroll: false });
  }, [debounced, facetValues, cohort, status, pathname, search, router]);

  function go(nextSearch: string, nextFacets: Record<string, string>, nextCohort = cohort, nextStatus = status) {
    const query = directoryQueryString(nextSearch, nextFacets, nextCohort, nextStatus);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <div className="mb-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-2 block text-sm font-medium" htmlFor="global-search">
            {copy.search}
          </label>
          <Input id="global-search" className="min-h-11 w-full" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
        <PeopleCohortSelect
          id="directory-cohort"
          label={copy.cohort}
          allLabel={copy.all}
          cohorts={cohorts}
          value={cohort}
          onChange={(next) => go(search, facetValues, next)}
        />
        {canFilter ? (
          <AppFilterSheet
            trigger={
              <Button type="button" variant="outline" className="min-h-11 w-full shrink-0 sm:w-auto">
                <ListFilter className="size-4" />
                {copy.filters}
                {count ? ` (${count})` : ''}
              </Button>
            }
            title={copy.filters}
            description={copy.filtersHint}
            clearLabel={copy.filtersClear}
            closeLabel={copy.close}
            onClear={() => go(search, {}, cohort, '')}
          >
            <PeopleFilters
              locale={locale}
              allLabel={copy.all}
              facets={facets}
              facetValues={facetValues}
              onFacets={(next) => go(search, next, cohort)}
              status={availabilityIsFilterable(listFields) ? status : undefined}
              onStatus={availabilityIsFilterable(listFields) ? (next) => go(search, facetValues, cohort, next) : undefined}
              statusLabel={copy.availability}
              statusOptions={[
                { value: 'available_for_hire', label: copy.hire },
                { value: 'project_partner', label: copy.partner },
                { value: 'mentor', label: copy.mentor },
                { value: 'unavailable', label: copy.unavailable },
              ]}
            />
          </AppFilterSheet>
        ) : null}
      </div>
      <p className="mb-6 max-w-160 text-base text-muted-foreground">{copy.privacy}</p>
      {rows.length === 0 && <p className="text-muted-foreground">{copy.empty}</p>}
      {rows.length > 0 && (
        <AppIndexList>
          {rows.map((profile) => {
            const view = projectPersonView({
              profile,
              fields: listFields,
              density: 'card',
              locale,
              cityLabel: displayPlaceLocality(profile.current_city, locale),
              availabilityLabel: availabilityLabel(profile.availability_status, copy),
            });
            return (
              <AppPersonRow
                key={profile.id}
                name={view.name}
                photo={view.photoUrl}
                headline={[view.headline, view.city].filter(Boolean).join(' · ')}
                languages={view.languages.map((item) => item.label)}
                languagesLabel={view.languagesHeading || copy.languages}
                status={view.availability}
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
        listFields={listFields}
        copy={copy}
        locale={locale}
        canContact={canContact}
        onClose={() => setSelected(null)}
      />
    </AppPageTemplate>
  );
}
