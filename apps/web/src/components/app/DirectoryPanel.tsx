'use client';

import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { useLocale } from '@/components/app/LocaleProvider';
import { PeopleCohortSelect, PeopleFilters } from '@/components/app/PeopleFilters';
import { PeopleMap } from '@/components/app/PeopleMap';
import { PeopleMapToggle } from '@/components/app/PeopleMapToggle';
import { PeoplePlaceFilters } from '@/components/app/PeoplePlaceFilters';
import { PersonInspect } from '@/components/app/PersonInspect';
import { uiCatalog } from '@/lang/catalog';
import { availabilityLabel } from '@/lib/people/availability';
import { activeFilterCount, directoryQueryString, type ListQueryExtras } from '@/lib/people/directory-query';
import type { PersonCard } from '@/lib/people/person-card';
import { useDebouncedValue } from '@/lib/people/use-debounced-value';
import { slotOn } from '@/modules/registry';
import { SHOWCASE_PAGE_SIZE, SHOWCASE_PAGE_SIZES, availabilityIsFilterable, projectPersonView, type CatalogField, type ListField } from '@community/directory';
import { contentFromCatalog, interpolate, mergeContent, pickContent } from '@community/identity';
import { DIRECTORY_MAP_VIEW } from '@community/map';
import { displayPlaceLocality, parseNearLatLon } from '@community/places';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { Button, Input, cn } from '@community/ui';
import {
  AppFilterSheet,
  AppPageTemplate,
  AppPersonCard,
  AppShowcaseEmpty,
  AppShowcaseGrid,
  AppShowcasePager,
} from '@community/ui-member';
import { ListFilter } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const EMPTY_EXTRAS: ListQueryExtras = {};

const CONTENT = mergeContent(
  mergeContent(
    contentFromCatalog(uiCatalog, 'plugin_directory', {
      kicker: 'page.kicker',
      title: 'page.title',
      subtitle: 'page.subtitle',
      search: 'page.search',
      searchHint: 'page.search_hint',
      emptyTitle: 'page.empty_title',
      empty: 'page.empty',
      emptyFilteredTitle: 'page.empty_filtered_title',
      emptyFiltered: 'page.empty_filtered',
      range: 'page.range',
      prev: 'page.prev',
      next: 'page.next',
      size: 'page.size',
      view: 'page.view',
      close: 'page.close',
      filters: 'page.filters',
      filtersClear: 'page.filters_clear',
      filtersHint: 'page.filters_hint',
      languages: 'page.languages',
      all: 'page.all',
      cohort: 'page.cohort',
      country: 'page.country',
      city: 'page.city',
      radius: 'page.radius',
      radiusKm: 'page.radius_km',
      viewMap: 'page.view_map',
      viewList: 'page.view_list',
      mapEmpty: 'page.map_empty',
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
    messageCount: 'form.message_count',
    sendTo: 'form.send_to',
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
  extras = EMPTY_EXTRAS,
  countries = [],
  page = 1,
  pageSize = SHOWCASE_PAGE_SIZE,
  total = 0,
}: {
  rows: PersonCard[];
  facets: CatalogField[];
  listFields?: ListField[];
  search: string;
  facetValues: Record<string, string>;
  cohorts: { id: string; name: string }[];
  cohort: string;
  status?: string;
  extras?: ListQueryExtras;
  countries?: string[];
  page?: number;
  pageSize?: number;
  total?: number;
}) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const enabled = useEnabledModules();
  const canContact = slotOn(enabled, SHOWCASE_ROW_ACTION);
  const canMap = slotOn(enabled, DIRECTORY_MAP_VIEW);
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<PersonCard | null>(null);
  const [term, setTerm] = useState(search);
  const debounced = useDebouncedValue(term, 300);
  const mapView = canMap && extras.view === 'map';
  const count = activeFilterCount(facetValues, [status, extras.country || '', extras.near || '']);
  const hasFacetSheet = facets.length > 0 || availabilityIsFilterable(listFields);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const sliced = Boolean(search || count || cohort);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  useEffect(() => {
    if (debounced === search) {
      return;
    }
    const query = directoryQueryString(debounced, facetValues, cohort, status, 1, pageSize, extras);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [debounced, facetValues, cohort, status, pathname, search, router, pageSize, extras]);

  function go(
    nextSearch: string,
    nextFacets: Record<string, string>,
    nextCohort = cohort,
    nextStatus = status,
    nextPage = 1,
    nextSize = pageSize,
    nextExtras = extras
  ) {
    const query = directoryQueryString(nextSearch, nextFacets, nextCohort, nextStatus, nextPage, nextSize, nextExtras);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function pager(className: string) {
    return (
      <AppShowcasePager
        className={className}
        page={page}
        pageSize={pageSize}
        total={total}
        prevLabel={copy.prev}
        nextLabel={copy.next}
        sizeLabel={copy.size}
        sizes={SHOWCASE_PAGE_SIZES}
        summary={interpolate(copy.range, { from: String(from), to: String(to), total: String(total) })}
        onPage={(next) => go(search, facetValues, cohort, status, next)}
        onPageSize={(next) => go(search, facetValues, cohort, status, 1, next)}
      />
    );
  }

  const placeValue = {
    country: extras.country || '',
    near: extras.near || '',
    radius: extras.radius,
    nearLabel: extras.nearLabel || '',
  };

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <div className="mb-6 flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="mb-2 block text-sm font-medium" htmlFor="global-search">
              {copy.search}
            </label>
            <Input
              id="global-search"
              className="min-h-11 w-full"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={copy.searchHint}
            />
          </div>
          <PeopleCohortSelect
            id="directory-cohort"
            label={copy.cohort}
            allLabel={copy.all}
            cohorts={cohorts}
            value={cohort}
            onChange={(next) => go(search, facetValues, next)}
          />
          {canMap ? (
            <PeopleMapToggle
              mapView={mapView}
              mapLabel={copy.viewMap}
              listLabel={copy.viewList}
              onChange={(next) => go(search, facetValues, cohort, status, 1, pageSize, { ...extras, view: next ? 'map' : '' })}
            />
          ) : null}
          <AppFilterSheet
            trigger={
              <Button
                type="button"
                variant="outline"
                className={cn('min-h-11 w-full shrink-0 sm:w-auto', !hasFacetSheet && 'lg:hidden')}
              >
                <ListFilter className="size-4" />
                {copy.filters}
                {count ? ` (${count})` : ''}
              </Button>
            }
            title={copy.filters}
            description={copy.filtersHint}
            clearLabel={copy.filtersClear}
            closeLabel={copy.close}
            onClear={() => go(search, {}, cohort, '', 1, pageSize, { view: extras.view })}
          >
            <div className="grid gap-6 lg:hidden">
              <PeoplePlaceFilters
                id="directory-place-sheet"
                locale={locale}
                countries={countries}
                value={placeValue}
                allCountriesLabel={copy.all}
                countryLabel={copy.country}
                cityLabel={copy.city}
                radiusLabel={copy.radius}
                onChange={(next) => go(search, facetValues, cohort, status, 1, pageSize, { ...extras, ...next })}
              />
            </div>
            {hasFacetSheet ? (
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
            ) : null}
          </AppFilterSheet>
        </div>
        <div className="hidden lg:block">
          <PeoplePlaceFilters
            id="directory-place"
            locale={locale}
            countries={countries}
            value={placeValue}
            allCountriesLabel={copy.all}
            countryLabel={copy.country}
            cityLabel={copy.city}
            radiusLabel={copy.radius}
            className="lg:grid-cols-3"
            onChange={(next) => go(search, facetValues, cohort, status, 1, pageSize, { ...extras, ...next })}
          />
        </div>
      </div>
      {rows.length === 0 ? (
        <AppShowcaseEmpty title={sliced ? copy.emptyFilteredTitle : copy.emptyTitle} body={sliced ? copy.emptyFiltered : copy.empty} />
      ) : (
        <>
          {mapView ? (
            <p className="mb-6 text-sm text-muted-foreground">
              {interpolate(copy.range, { from: String(from), to: String(to), total: String(total) })}
            </p>
          ) : (
            pager('mb-6')
          )}
          {mapView ? (
            <PeopleMap
              rows={rows}
              emptyLabel={copy.mapEmpty}
              near={parseNearLatLon(extras.near || '')}
              radiusKm={extras.radius}
              onOpen={setSelected}
            />
          ) : (
            <AppShowcaseGrid>
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
                  <AppPersonCard
                    key={profile.id}
                    variant="compact"
                    name={view.name}
                    photoUrl={view.photoUrl}
                    headline={view.headline}
                    city={view.city}
                    languages={view.languages.map((item) => item.label)}
                    availability={view.availability}
                    actionLabel={copy.view}
                    onOpen={() => setSelected(profile)}
                  />
                );
              })}
            </AppShowcaseGrid>
          )}
          {mapView ? null : pager('mt-10')}
        </>
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
