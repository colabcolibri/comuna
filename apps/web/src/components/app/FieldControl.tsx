'use client';

import React, { useState } from 'react';
import { Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, toast, cn } from '@community/ui';
import { contentFromCatalog, interpolate, pickContent, pickLocalizedText, type LocalizedText } from '@community/identity';
import type { CatalogField } from '@community/directory';
import type { GeoPlace } from '@community/places';
import { CitySearchField } from '@/components/app/CitySearchField';
import { LanguagesField } from '@/components/app/LanguagesField';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_identity', {
  pick: 'profile.avatar_pick',
  change: 'profile.avatar_change',
  uploading: 'profile.avatar_uploading',
  invalid: 'profile.avatar_invalid',
  empty: 'profile.select_empty',
});

export function FieldControl({
  field,
  locale,
  value,
  onChange,
  pairPt,
  pairEn,
  initials,
}: {
  field: CatalogField;
  locale: string;
  value: unknown;
  onChange: (value: unknown) => void;
  pairPt: string;
  pairEn: string;
  initials?: string;
}) {
  const label = pickLocalizedText(field.label, locale) || field.name;
  const description = pickLocalizedText(field.description, locale);
  const id = `field-${field.name}`;

  if (field.type === 'image') {
    return (
      <ImageControl
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        initials={initials}
      />
    );
  }

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
              className={field.name === 'bio' ? 'min-h-32 w-full' : 'min-h-11 w-full'}
              value={pt}
              onChange={(e) => onChange(pairFrom(pt, en, 'pt-BR', e.target.value))}
              {...extra}
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor={`${id}-en`}>{interpolate(pairEn, { label })}</Label>
            <Field
              id={`${id}-en`}
              className={field.name === 'bio' ? 'min-h-32 w-full' : 'min-h-11 w-full'}
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
        <Checkbox id={id} checked={Boolean(value)} onCheckedChange={(checked) => onChange(checked === true)} />
        <span>
          <span className="font-medium">{label}</span>
          {description ? <span className="block text-muted-foreground">{description}</span> : null}
        </span>
      </label>
    );
  }

  if (field.type === 'checkbox') {
    if (field.name === 'languages') {
      return (
        <LanguagesField
          field={field}
          locale={locale}
          value={value}
          onChange={onChange}
        />
      );
    }
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset className="space-y-2 min-w-0">
        <legend className="text-sm font-medium">{label}</legend>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <div className="flex flex-wrap gap-2">
          {field.options.map((option) => {
            const on = selected.includes(option.value);
            const name = pickLocalizedText(option.label, locale) || option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={on}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-lg border px-3 text-sm',
                  on ? 'border-foreground bg-secondary text-foreground' : 'border-border text-muted-foreground'
                )}
                onClick={() => {
                  onChange(on ? selected.filter((item) => item !== option.value) : [...selected, option.value]);
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'select' || field.type === 'radio') {
    const empty = pickContent(CONTENT, locale).empty;
    return (
      <div className="space-y-2 min-w-0">
        <Label htmlFor={id}>{label}</Label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <Select value={String(value || '') || undefined} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full min-h-11">
            <SelectValue placeholder={empty} />
          </SelectTrigger>
          <SelectContent>
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

  const Field = field.type === 'textarea' ? Textarea : Input;
  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor={id}>{label}</Label>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <Field
        id={id}
        type={field.type === 'url' ? 'url' : undefined}
        className={field.type === 'textarea' ? 'min-h-32 w-full' : 'min-h-11 w-full'}
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        {...(field.type === 'textarea' ? { rows: 4 } : {})}
      />
    </div>
  );
}

function LanguagesControl({
  field,
  locale,
  value,
  onChange,
}: {
  field: CatalogField;
  locale: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = pickLocalizedText(field.label, locale) || field.name;
  const description = pickLocalizedText(field.description, locale);
  const copy = pickContent(CONTENT, locale);
  const selected = parseLanguages(value);
  const levels: Record<Proficiency, string> = {
    basic: copy.proficiency_basic,
    intermediate: copy.proficiency_intermediate,
    fluent: copy.proficiency_fluent,
    native: copy.proficiency_native,
  };

  function setLanguage(code: string, next: SpokenLanguage | null) {
    if (!next) {
      onChange(selected.filter((item) => item.code !== code));
      return;
    }
    if (selected.some((item) => item.code === code)) {
      onChange(selected.map((item) => (item.code === code ? next : item)));
      return;
    }
    onChange([...selected, next]);
  }

  return (
    <fieldset className="space-y-2 min-w-0">
      <legend className="text-sm font-medium">{label}</legend>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {field.options.map((option) => {
          const name = pickLocalizedText(option.label, locale) || option.value;
          const current = selected.find((item) => item.code === option.value);
          const on = Boolean(current);
          const id = `field-${field.name}-${option.value}`;
          return (
            <li key={option.value} className="flex min-w-0 items-center gap-2">
              <label htmlFor={id} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-sm">
                <Checkbox
                  id={id}
                  checked={on}
                  onCheckedChange={(checked) => {
                    setLanguage(
                      option.value,
                      checked === true ? { code: option.value, proficiency: 'fluent' } : null
                    );
                  }}
                />
                <span className="min-w-0 truncate">{name}</span>
              </label>
              {on && current ? (
                <Select
                  value={current.proficiency}
                  onValueChange={(proficiency) =>
                    setLanguage(option.value, { code: option.value, proficiency: proficiency as Proficiency })
                  }
                >
                  <SelectTrigger
                    className="w-[9.5rem] shrink-0 min-h-11"
                    aria-label={`${copy.proficiency}: ${name}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCIES.map((level) => (
                      <SelectItem key={level} value={level}>
                        {levels[level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function ImageControl({
  id,
  label,
  value,
  onChange,
  initials,
}: {
  id: string;
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  initials?: string;
}) {
  const copy = pickContent(CONTENT, useLocale());
  const [busy, setBusy] = useState(false);
  const src = typeof value === 'string' ? value : '';
  const mark = (initials || '?').slice(0, 2);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setBusy(true);
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/profiles/me/avatar', { method: 'POST', body });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    event.target.value = '';
    if (!res.ok) {
      toast.error(data.error?.message || copy.invalid);
      return;
    }
    onChange(data.avatar_url);
  }

  return (
    <div className="flex w-28 shrink-0 flex-col items-center gap-2 sm:w-32">
      <span className="relative block size-28 overflow-hidden rounded-full border border-border bg-primary text-primary-foreground focus-within:ring-[3px] focus-within:ring-ring/50 sm:size-32">
        {src ? (
          <img src={src} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-2xl font-medium" aria-hidden>
            {mark}
          </span>
        )}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label={label}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={busy}
          onChange={(event) => void onFile(event)}
        />
      </span>
      <span className="text-center text-sm text-muted-foreground">
        {busy ? copy.uploading : src ? copy.change : copy.pick}
      </span>
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
