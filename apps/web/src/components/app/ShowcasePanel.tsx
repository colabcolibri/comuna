'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  AppFilterSheet,
  AppShowcaseCard,
  AppShowcaseGrid,
  AppShowcasePager,
  AppShowcasePortal,
} from '@community/ui-member';
import { Button, Input } from '@community/ui';
import { contentFromCatalog, interpolate, mergeContent, pickContent, pickLocalizedText } from '@community/identity';
import { displayPlaceLocality } from '@community/places';
import type { CatalogField } from '@community/directory';
import { ListFilter, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { PeopleFilters } from '@/components/app/PeopleFilters';
import { PersonInspect } from '@/components/app/PersonInspect';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { uiCatalog } from '@/lang/catalog';
import { slotOn } from '@/modules/registry';
import { profileChips } from '@/lib/people/chips';
import { activeFilterCount, directoryQueryString } from '@/lib/people/directory-query';
import type { PersonCard } from '@/lib/people/person-card';
import { useDebouncedValue } from '@/lib/people/use-debounced-value';

const CONTENT = mergeContent(
  contentFromCatalog(uiCatalog, 'plugin_showcase', {
    title: 'page.title',
    subtitle: 'page.subtitle',
    empty: 'page.empty',
    view: 'page.view',
    close: 'page.close',
    privacy: 'page.privacy',
    search: 'page.search',
    searchHint: 'page.search_hint',
    count: 'page.count',
    range: 'page.range',
    prev: 'page.prev',
    next: 'page.next',
    filters: 'page.filters',
    filtersClear: 'page.filters_clear',
    filtersHint: 'page.filters_hint',
    all: 'page.all',
    availability: 'page.availability',
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
    success: 'form.success',
    email: 'form.email',
    message: 'form.message',
  })
);

export function ShowcasePanel({
  rows,
  lead,
  communityName,
  communityLede,
  facets = [],
  search = '',
  facetValues = {},
  status = '',
  page = 1,
  pageSize = 12,
  total = 0,
}: {
  rows: PersonCard[];
  lead?: ReactNode;
  communityName?: string;
  communityLede?: string;
  facets?: CatalogField[];
  search?: string;
  facetValues?: Record<string, string>;
  status?: string;
  page?: number;
  pageSize?: number;
  total?: number;
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
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  useEffect(() => {
    if (debounced === search) {
      return;
    }
    const query = directoryQueryString(debounced, facetValues, '', status, 1);
    const next = query ? `${pathname}?${query}` : pathname;
    router.replace(next, { scroll: false });
  }, [debounced, facetValues, status, pathname, search, router]);

  function go(nextSearch: string, nextFacets: Record<string, string>, nextStatus = status, nextPage = 1) {
    const query = directoryQueryString(nextSearch, nextFacets, '', nextStatus, nextPage);
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
              onClear={() => go(search, {}, '')}
            >
              <PeopleFilters
                locale={locale}
                allLabel={copy.all}
                facets={facets}
                facetValues={facetValues}
                onFacets={(next) => go(search, next, status)}
                status={status}
                onStatus={(next) => go(search, facetValues, next)}
                statusLabel={copy.availability}
                statusOptions={[
                  { value: 'available_for_hire', label: copy.hire },
                  { value: 'project_partner', label: copy.partner },
                  { value: 'mentor', label: copy.mentor },
                  { value: 'unavailable', label: copy.unavailable },
                ]}
              />
            </AppFilterSheet>
          </div>
          <p className="text-sm font-medium text-foreground">{interpolate(copy.count, { n: String(total) })}</p>
        </div>
      }
    >
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        <AppShowcaseGrid>
          {rows.map((profile) => {
            const headline = pickLocalizedText(profile.headline, locale);
            const summary = pickLocalizedText(profile.bio, locale);
            return (
              <AppShowcaseCard
                key={profile.id}
                name={profile.full_name}
                photoUrl={profile.avatar_url}
                headline={headline}
                summary={summary}
                city={displayPlaceLocality(profile.current_city, locale)}
                chips={profileChips(profile, copy, locale)}
                actionLabel={copy.view}
                onOpen={() => setSelected(profile)}
              />
            );
          })}
        </AppShowcaseGrid>
      )}
      <AppShowcasePager
        page={page}
        pageSize={pageSize}
        total={total}
        prevLabel={copy.prev}
        nextLabel={copy.next}
        summary={interpolate(copy.range, { from: String(from), to: String(to), total: String(total) })}
        onPage={(next) => go(search, facetValues, status, next)}
      />
      <PersonInspect
        profile={selected}
        copy={copy}
        locale={locale}
        canContact={canContact}
        onClose={() => setSelected(null)}
      />
    </AppShowcasePortal>
  );
}
