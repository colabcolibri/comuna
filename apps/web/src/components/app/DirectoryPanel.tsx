'use client';

import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { useLocale } from '@/components/app/LocaleProvider';
import { PeopleCohortSelect, PeopleFilters } from '@/components/app/PeopleFilters';
import { PeopleMap } from '@/components/app/PeopleMap';
import { PeopleMapToggle } from '@/components/app/PeopleMapToggle';
import { PeoplePlaceFilters } from '@/components/app/PeoplePlaceFilters';
import { inspectSections } from '@/components/app/inspect-sections';
import { PersonInspect } from '@/components/app/PersonInspect';
import { uiCatalog } from '@/lang/catalog';
import { activeFilterCount, directoryQueryString, type ListQueryExtras } from '@/lib/people/directory-query';
import type { PersonCard } from '@/lib/people/person-card';
import { primaryOfferingLabels, type TalentCategoryView } from '@/lib/people/offering-label';
import { PeopleSearchField } from '@/components/app/PeopleSearchField';
import { slotOn } from '@/modules/registry';
import {
  SHOWCASE_PAGE_SIZE,
  SHOWCASE_PAGE_SIZES,
  cohortIsFilterable,
  languagesIsFilterable,
  projectPersonView,
  type CatalogField,
  type ListField,
} from '@community/directory';
import { contentFromCatalog, interpolate, mergeContent, pickContent } from '@community/identity';
import { DIRECTORY_MAP_VIEW } from '@community/map';
import { displayPlaceLocality, parseNearLatLon } from '@community/places';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { Button, cn } from '@community/ui';
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
import { useState } from 'react';

const EMPTY_EXTRAS: ListQueryExtras = {};

const CONTENT = mergeContent(
  mergeContent(
  mergeContent(
    contentFromCatalog(uiCatalog, 'plugin_directory', {
      kicker: 'page.kicker',
      title: 'page.title',
      subtitle: 'page.subtitle',
      search: 'page.search',
      searchHint: 'page.search_hint',
      searchApply: 'page.search_apply',
      searchClear: 'page.search_clear',
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
),
contentFromCatalog(uiCatalog, 'core_identity', {
  talents: 'talent.title',
  openLink: 'talent.open',
  talentFilter: 'talent.title',
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
  extras = EMPTY_EXTRAS,
  countries = [],
  page = 1,
  pageSize = SHOWCASE_PAGE_SIZE,
  total = 0,
  talentFilterEnabled = false,
  talentCategories = [],
}: {
  rows: PersonCard[];
  facets: CatalogField[];
  listFields?: ListField[];
  search: string;
  facetValues: Record<string, string>;
  cohorts: { id: string; name: string }[];
  cohort: string;
  extras?: ListQueryExtras;
  countries?: string[];
  page?: number;
  pageSize?: number;
  total?: number;
  talentFilterEnabled?: boolean;
  talentCategories?: TalentCategoryView[];
}) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const enabled = useEnabledModules();
  const canContact = slotOn(enabled, SHOWCASE_ROW_ACTION);
  const canMap = slotOn(enabled, DIRECTORY_MAP_VIEW);
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<PersonCard | null>(null);
  const mapView = canMap && extras.view === 'map';
  const count = activeFilterCount(facetValues, [
    extras.lang || '',
    extras.country || '',
    extras.near || '',
    talentFilterEnabled ? extras.talentCategory || '' : '',
  ]);
  const hasFacetSheet = facets.length > 0 || languagesIsFilterable(listFields) || talentFilterEnabled;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const sliced = Boolean(search || count || cohort || extras.lang);

  function go(
    nextSearch: string,
    nextFacets: Record<string, string>,
    nextCohort = cohort,
    nextPage = 1,
    nextSize = pageSize,
    nextExtras = extras
  ) {
    const query = directoryQueryString(nextSearch, nextFacets, nextCohort, nextPage, nextSize, nextExtras);
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
        onPage={(next) => go(search, facetValues, cohort, next)}
        onPageSize={(next) => go(search, facetValues, cohort, 1, next)}
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
          <PeopleSearchField
            id="global-search"
            label={copy.search}
            hint={copy.searchHint}
            applyLabel={copy.searchApply}
            clearLabel={copy.searchClear}
            committed={search}
            onApply={(term) => go(term, facetValues, cohort)}
            onClear={() => go('', facetValues, cohort)}
          />
          {cohortIsFilterable(listFields) ? (
            <PeopleCohortSelect
              id="directory-cohort"
              label={copy.cohort}
              allLabel={copy.all}
              cohorts={cohorts}
              value={cohort}
              onChange={(next) => go(search, facetValues, next)}
            />
          ) : null}
          {canMap ? (
            <PeopleMapToggle
              mapView={mapView}
              mapLabel={copy.viewMap}
              listLabel={copy.viewList}
              onChange={(next) => go(search, facetValues, cohort, 1, pageSize, { ...extras, view: next ? 'map' : '' })}
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
            onClear={() =>
              go(search, {}, cohort, 1, pageSize, { view: extras.view, lang: '', talentCategory: '' })
            }
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
                onChange={(next) => go(search, facetValues, cohort, 1, pageSize, { ...extras, ...next })}
              />
            </div>
            {hasFacetSheet ? (
              <PeopleFilters
                locale={locale}
                allLabel={copy.all}
                facets={facets}
                facetValues={facetValues}
                onFacets={(next) => go(search, next, cohort)}
                languages={languagesIsFilterable(listFields) ? extras.lang || '' : undefined}
                onLanguages={
                  languagesIsFilterable(listFields)
                    ? (next) => go(search, facetValues, cohort, 1, pageSize, { ...extras, lang: next })
                    : undefined
                }
                languagesLabel={copy.languages}
                talentCategory={talentFilterEnabled ? extras.talentCategory || '' : undefined}
                talentCategoryLabel={talentFilterEnabled ? copy.talentFilter : undefined}
                onTalentCategory={
                  talentFilterEnabled
                    ? (next) => go(search, facetValues, cohort, 1, pageSize, { ...extras, talentCategory: next })
                    : undefined
                }
                talentCategories={talentFilterEnabled ? talentCategories : []}
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
            onChange={(next) => go(search, facetValues, cohort, 1, pageSize, { ...extras, ...next })}
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
                });
                const talent = primaryOfferingLabels(profile.offerings, locale, talentCategories);
                return (
                  <AppPersonCard
                    key={profile.id}
                    variant="compact"
                    name={view.name}
                    photoUrl={view.photoUrl}
                    headline={view.headline}
                    city={view.city}
                    cohort={view.cohort}
                    talentCategory={talent.category}
                    talentLine={talent.title}
                    languages={view.languages.map((item) => item.label)}
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
        sections={inspectSections(enabled, selected, copy, locale, talentCategories)}
        onClose={() => setSelected(null)}
      />
    </AppPageTemplate>
  );
}
