'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  AppFilterSheet,
  AppShowcaseCard,
  AppShowcaseEmpty,
  AppShowcaseGrid,
  AppShowcasePager,
  AppShowcasePortal,
} from '@community/ui-member';
import { Button, Input } from '@community/ui';
import { contentFromCatalog, interpolate, mergeContent, pickContent } from '@community/identity';
import { displayPlaceLocality, parseNearLatLon } from '@community/places';
import { SHOWCASE_PAGE_SIZE, SHOWCASE_PAGE_SIZES, availabilityIsFilterable, projectPersonView, type CatalogField, type ListField } from '@community/directory';
import { ListFilter, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { PeopleFilters } from '@/components/app/PeopleFilters';
import { PeopleMap } from '@/components/app/PeopleMap';
import { PeopleMapToggle } from '@/components/app/PeopleMapToggle';
import { PeoplePlaceFilters } from '@/components/app/PeoplePlaceFilters';
import { PersonInspect } from '@/components/app/PersonInspect';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { SHOWCASE_MAP_VIEW } from '@community/map';
import { uiCatalog } from '@/lang/catalog';
import { slotOn } from '@/modules/registry';
import { availabilityLabel } from '@/lib/people/availability';
import { activeFilterCount, directoryQueryString, type ListQueryExtras } from '@/lib/people/directory-query';
import type { PersonCard } from '@/lib/people/person-card';
import { useDebouncedValue } from '@/lib/people/use-debounced-value';

const EMPTY_EXTRAS: ListQueryExtras = {};

const CONTENT = mergeContent(
  contentFromCatalog(uiCatalog, 'plugin_showcase', {
    title: 'page.title',
    subtitle: 'page.subtitle',
    emptyTitle: 'page.empty_title',
    empty: 'page.empty',
    emptyFilteredTitle: 'page.empty_filtered_title',
    emptyFiltered: 'page.empty_filtered',
    view: 'page.view',
    close: 'page.close',
    privacy: 'page.privacy',
    search: 'page.search',
    searchHint: 'page.search_hint',
    range: 'page.range',
    prev: 'page.prev',
    next: 'page.next',
    size: 'page.size',
    filters: 'page.filters',
    filtersClear: 'page.filters_clear',
    filtersHint: 'page.filters_hint',
    languages: 'page.languages',
    all: 'page.all',
    availability: 'page.availability',
    country: 'page.country',
    city: 'page.city',
    radius: 'page.radius',
    radiusKm: 'page.radius_km',
    viewMap: 'page.view_map',
    viewList: 'page.view_list',
    mapEmpty: 'page.map_empty',
    langPt: 'lang.pt',
    langEn: 'lang.en',
    langEs: 'lang.es',
    langFr: 'lang.fr',
    hire: 'avail.available_for_hire',
    partner: 'avail.project_partner',
    mentor: 'avail.mentor',
    unavailable: 'avail.unavailable',
    host: 'host.yes',
    linkedin: 'link.linkedin',
    github: 'link.github',
    portfolio: 'link.portfolio',
  }),
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
    privacy: 'form.privacy',
  })
);

export function ShowcasePanel({
  rows,
  lead,
  communityName,
  communityLede,
  facets = [],
  listFields = [],
  search = '',
  facetValues = {},
  status = '',
  extras = EMPTY_EXTRAS,
  countries = [],
  page = 1,
  pageSize = SHOWCASE_PAGE_SIZE,
  total = 0,
}: {
  rows: PersonCard[];
  lead?: ReactNode;
  communityName?: string;
  communityLede?: string;
  facets?: CatalogField[];
  listFields?: ListField[];
  search?: string;
  facetValues?: Record<string, string>;
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
  const canMap = slotOn(enabled, SHOWCASE_MAP_VIEW);
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<PersonCard | null>(null);
  const [term, setTerm] = useState(search);
  const debounced = useDebouncedValue(term, 300);
  const canFilter = facets.length > 0 || availabilityIsFilterable(listFields);
  const mapView = canMap && extras.view === 'map';
  const count = activeFilterCount(facetValues, [status, extras.country || '', extras.near || '']);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  useEffect(() => {
    if (debounced === search) {
      return;
    }
    const query = directoryQueryString(debounced, facetValues, '', status, 1, pageSize, extras);
    const next = query ? `${pathname}?${query}` : pathname;
    router.replace(next, { scroll: false });
  }, [debounced, facetValues, status, pathname, search, router, pageSize, extras]);

  function go(
    nextSearch: string,
    nextFacets: Record<string, string>,
    nextStatus = status,
    nextPage = 1,
    nextSize = pageSize,
    nextExtras = extras
  ) {
    const query = directoryQueryString(nextSearch, nextFacets, '', nextStatus, nextPage, nextSize, nextExtras);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <AppShowcasePortal
      title={communityName || copy.title}
      lede={communityLede || copy.subtitle}
      actions={lead}
      toolbar={
        <div className="mb-8 flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-sm font-medium" htmlFor="showcase-search">
                {copy.search}
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="showcase-search"
                  className="h-12 min-h-12 w-full pl-10 text-base md:text-base"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder={copy.searchHint}
                />
              </div>
            </div>
            {canMap ? (
              <PeopleMapToggle
                mapView={mapView}
                mapLabel={copy.viewMap}
                listLabel={copy.viewList}
                onChange={(next) => go(search, facetValues, status, 1, pageSize, { ...extras, view: next ? 'map' : '' })}
              />
            ) : null}
            {canFilter ? (
            <AppFilterSheet
              trigger={
                <Button type="button" variant="outline" className="min-h-12 w-full shrink-0 sm:w-auto">
                  <ListFilter className="size-4" />
                  {copy.filters}
                  {count ? ` (${count})` : ''}
                </Button>
              }
              title={copy.filters}
              description={copy.filtersHint}
              clearLabel={copy.filtersClear}
              closeLabel={copy.close}
              onClear={() => go(search, {}, '', 1, pageSize, { view: extras.view })}
            >
              <PeopleFilters
                locale={locale}
                allLabel={copy.all}
                facets={facets}
                facetValues={facetValues}
                onFacets={(next) => go(search, next, status)}
                status={availabilityIsFilterable(listFields) ? status : undefined}
                onStatus={availabilityIsFilterable(listFields) ? (next) => go(search, facetValues, next) : undefined}
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
          <PeoplePlaceFilters
            id="showcase-place"
            locale={locale}
            countries={countries}
            value={{
              country: extras.country || '',
              near: extras.near || '',
              radius: extras.radius,
              nearLabel: extras.nearLabel || '',
            }}
            allCountriesLabel={copy.all}
            countryLabel={copy.country}
            cityLabel={copy.city}
            radiusLabel={copy.radius}
            onChange={(next) => go(search, facetValues, status, 1, pageSize, { ...extras, ...next })}
          />
        </div>
      }
    >
      {rows.length === 0 ? (
        <AppShowcaseEmpty
          title={search || count ? copy.emptyFilteredTitle : copy.emptyTitle}
          body={search || count ? copy.emptyFiltered : copy.empty}
        />
      ) : (
        <>
          {mapView ? (
            <p className="mb-6 text-sm text-muted-foreground">
              {interpolate(copy.range, { from: String(from), to: String(to), total: String(total) })}
            </p>
          ) : (
            <AppShowcasePager
              className="mb-6"
              page={page}
              pageSize={pageSize}
              total={total}
              prevLabel={copy.prev}
              nextLabel={copy.next}
              sizeLabel={copy.size}
              sizes={SHOWCASE_PAGE_SIZES}
              summary={interpolate(copy.range, { from: String(from), to: String(to), total: String(total) })}
              onPage={(next) => go(search, facetValues, status, next)}
              onPageSize={(next) => go(search, facetValues, status, 1, next)}
            />
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
                  <AppShowcaseCard
                    key={profile.id}
                    name={view.name}
                    photoUrl={view.photoUrl}
                    headline={view.headline}
                    summary={view.summary}
                    city={view.city}
                    languagesLabel={view.languagesHeading || copy.languages}
                    languages={view.languages.map((item) => item.label)}
                    availabilityLabel={view.availabilityHeading || copy.availability}
                    availability={view.availability}
                    facts={view.facts}
                    actionLabel={copy.view}
                    onOpen={() => setSelected(profile)}
                  />
                );
              })}
            </AppShowcaseGrid>
          )}
          {mapView ? null : (
            <AppShowcasePager
              className="mt-10"
              page={page}
              pageSize={pageSize}
              total={total}
              prevLabel={copy.prev}
              nextLabel={copy.next}
              sizeLabel={copy.size}
              sizes={SHOWCASE_PAGE_SIZES}
              summary={interpolate(copy.range, { from: String(from), to: String(to), total: String(total) })}
              onPage={(next) => go(search, facetValues, status, next)}
              onPageSize={(next) => go(search, facetValues, status, 1, next)}
            />
          )}
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
    </AppShowcasePortal>
  );
}
