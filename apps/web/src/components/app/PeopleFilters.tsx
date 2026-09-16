'use client';

import { languageFilterQueryValue, parseLanguageFilter, type CatalogField } from '@community/directory';
import { pickLocalizedText, spokenLanguageOptions } from '@community/identity';
import { AppFilterListbox } from '@community/ui-member';
import { Checkbox, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@community/ui';

export function PeopleCohortSelect({
  id,
  label,
  allLabel,
  cohorts,
  value,
  onChange,
}: {
  id: string;
  label: string;
  allLabel: string;
  cohorts: { id: string; name: string }[];
  value: string;
  onChange: (next: string) => void;
}) {
  if (cohorts.length === 0) {
    return null;
  }
  return (
    <div className="min-w-0 w-full sm:max-w-56">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Select value={value || 'all'} onValueChange={(next) => onChange(next === 'all' ? '' : next)}>
        <SelectTrigger id={id} className="min-h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {cohorts.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PeopleFilters({
  locale,
  allLabel,
  facets,
  facetValues,
  onFacets,
  status,
  onStatus,
  statusLabel,
  statusOptions,
  languages,
  onLanguages,
  languagesLabel,
}: {
  locale: string;
  allLabel: string;
  facets: CatalogField[];
  facetValues: Record<string, string>;
  onFacets: (next: Record<string, string>) => void;
  status?: string;
  onStatus?: (next: string) => void;
  statusLabel?: string;
  statusOptions?: { value: string; label: string }[];
  languages?: string;
  onLanguages?: (next: string) => void;
  languagesLabel?: string;
}) {
  return (
    <div className="min-w-0 space-y-6">
      {onLanguages && languagesLabel ? (
        <PeopleLanguageFilter
          locale={locale}
          label={languagesLabel}
          value={languages || ''}
          onChange={onLanguages}
        />
      ) : null}
      {onStatus && statusOptions?.length ? (
        <div className="min-w-0 space-y-2">
          <Label htmlFor="people-filter-status">{statusLabel}</Label>
          <Select value={status || 'all'} onValueChange={(value) => onStatus(value === 'all' ? '' : value)}>
            <SelectTrigger id="people-filter-status" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{allLabel}</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {facets.map((field) => (
        <FacetControl
          key={field.name}
          field={field}
          locale={locale}
          allLabel={allLabel}
          value={facetValues[field.name] || ''}
          onChange={(next) => onFacets({ ...facetValues, [field.name]: next })}
        />
      ))}
    </div>
  );
}

function PeopleLanguageFilter({
  locale,
  label,
  value,
  onChange,
}: {
  locale: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <AppFilterListbox
      label={label}
      selected={parseLanguageFilter(value)}
      options={spokenLanguageOptions(locale)}
      onChange={(next) => onChange(languageFilterQueryValue(next))}
    />
  );
}

function FacetControl({
  field,
  locale,
  allLabel,
  value,
  onChange,
}: {
  field: CatalogField;
  locale: string;
  allLabel: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const label = pickLocalizedText(field.label, locale) || field.name;
  if (field.type === 'boolean') {
    return (
      <label className="flex min-h-11 min-w-0 items-center gap-2 text-sm">
        <Checkbox checked={value === 'true'} onCheckedChange={(checked) => onChange(checked === true ? 'true' : '')} />
        <span className="min-w-0">{label}</span>
      </label>
    );
  }
  if (field.type === 'select' || field.type === 'radio') {
    return (
      <div className="min-w-0 space-y-2">
        <Label>{label}</Label>
        <Select value={value || 'all'} onValueChange={(next) => onChange(next === 'all' ? '' : next)}>
          <SelectTrigger className="min-h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{allLabel}</SelectItem>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {pickLocalizedText(option.label, locale) || option.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === 'checkbox') {
    const selected = value.split(',').filter(Boolean);
    return (
      <AppFilterListbox
        label={label}
        selected={selected}
        options={field.options.map((option) => ({
          value: option.value,
          label: pickLocalizedText(option.label, locale) || option.value,
        }))}
        onChange={(next) => onChange(next.join(','))}
      />
    );
  }
  return null;
}
