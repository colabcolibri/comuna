'use client';

import React from 'react';
import { Checkbox, Input, Label, Select, Textarea } from '@community/ui';
import { interpolate, pickLocalizedText, type LocalizedText } from '@community/identity';
import type { CatalogField } from '@community/directory';
import type { GeoPlace } from '@community/places';
import { CitySearchField } from '@/components/app/CitySearchField';

export function FieldControl({
  field,
  locale,
  value,
  onChange,
  pairPt,
  pairEn,
}: {
  field: CatalogField;
  locale: string;
  value: unknown;
  onChange: (value: unknown) => void;
  pairPt: string;
  pairEn: string;
}) {
  const label = pickLocalizedText(field.label, locale) || field.name;
  const description = pickLocalizedText(field.description, locale);
  const id = `field-${field.name}`;

  if (field.type === 'city') {
    return (
      <div className="space-y-1 min-w-0">
        <CitySearchField id={id} label={label} value={(value as GeoPlace | null) || null} onChange={onChange} />
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    );
  }

  if (field.type === 'localized_text') {
    const entries = Array.isArray(value) ? (value as LocalizedText) : [];
    const pt = valueAtSafe(entries, 'pt-BR');
    const en = valueAtSafe(entries, 'en');
    const Field = field.name === 'bio' ? Textarea : Input;
    const extra = field.name === 'bio' ? { rows: 4 as const } : {};
    return (
      <div className="space-y-2 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 min-w-0">
            <Label htmlFor={`${id}-pt`}>{interpolate(pairPt, { label })}</Label>
            <Field
              id={`${id}-pt`}
              value={pt}
              onChange={(e) => onChange(pairFrom(pt, en, 'pt-BR', e.target.value))}
              {...extra}
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor={`${id}-en`}>{interpolate(pairEn, { label })}</Label>
            <Field
              id={`${id}-en`}
              value={en}
              onChange={(e) => onChange(pairFrom(pt, en, 'en', e.target.value))}
              {...extra}
            />
          </div>
        </div>
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-3 min-h-11 text-sm min-w-0">
        <Checkbox id={id} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span>
          <span className="font-medium">{label}</span>
          {description ? <span className="block text-muted-foreground">{description}</span> : null}
        </span>
      </label>
    );
  }

  if (field.type === 'checkbox') {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset className="space-y-2 min-w-0">
        <legend className="text-sm font-medium">{label}</legend>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <div className="flex flex-wrap gap-4">
          {field.options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 min-h-11 text-sm">
              <Checkbox
                checked={selected.includes(option.value)}
                onChange={(e) => {
                  onChange(
                    e.target.checked
                      ? [...selected, option.value]
                      : selected.filter((item) => item !== option.value)
                  );
                }}
              />
              {pickLocalizedText(option.label, locale) || option.value}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'select' || field.type === 'radio') {
    return (
      <div className="space-y-2 min-w-0">
        <Label htmlFor={id}>{label}</Label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <Select id={id} className="w-full min-h-11" value={String(value || '')} onChange={(e) => onChange(e.target.value)}>
          <option value="" />
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {pickLocalizedText(option.label, locale) || option.value}
            </option>
          ))}
        </Select>
      </div>
    );
  }

  const Field = field.type === 'textarea' ? Textarea : Input;
  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor={id}>{label}</Label>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <Field
        id={id}
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        {...(field.type === 'textarea' ? { rows: 4 } : {})}
      />
    </div>
  );
}

function valueAtSafe(entries: LocalizedText, locale: 'pt-BR' | 'en') {
  return entries.find((entry) => entry.locale === locale)?.value || '';
}

function pairFrom(pt: string, en: string, which: 'pt-BR' | 'en', next: string): LocalizedText {
  const nextPt = which === 'pt-BR' ? next : pt;
  const nextEn = which === 'en' ? next : en;
  return [
    ...(nextPt ? [{ locale: 'pt-BR' as const, value: nextPt }] : []),
    ...(nextEn ? [{ locale: 'en' as const, value: nextEn }] : []),
  ];
}
