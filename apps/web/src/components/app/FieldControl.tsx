'use client';

import React, { useState } from 'react';
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, toast, cn } from '@community/ui';
import { AppSwitcher } from '@community/ui-member';
import { contentFromCatalog, pickContent, pickLocalizedText, type LocalizedText } from '@community/identity';
import type { CatalogField } from '@community/directory';
import { LocalizedCopyField } from '@/components/app/LocalizedCopyField';
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
  required: 'profile.required',
  optional: 'profile.optional',
});

export function FieldControl({
  field,
  locale,
  value,
  onChange,
  initials,
  aside,
  maxLength,
}: {
  field: CatalogField;
  locale: string;
  value: unknown;
  onChange: (value: unknown) => void;
  initials?: string;
  aside?: React.ReactNode;
  maxLength?: number;
}) {
  const label = pickLocalizedText(field.label, locale) || field.name;
  const description = pickLocalizedText(field.description, locale);
  const copy = pickContent(CONTENT, locale);
  const id = `field-${field.name}`;
  const meta = {
    label,
    required: field.required,
    requiredLabel: copy.required,
    end: aside,
  };

  if (field.type === 'image') {
    return (
      <ImageControl
        id={id}
        label={label}
        required={field.required}
        requiredLabel={copy.required}
        value={value}
        onChange={onChange}
        initials={initials}
      />
    );
  }

  if (field.type === 'city') {
    return (
      <div className="space-y-1 min-w-0">
        <CitySearchField
          id={id}
          label={label}
          status={field.required ? copy.required : undefined}
          value={(value as GeoPlace | null) || null}
          onChange={onChange}
        />
        {description ? <p className="text-base leading-snug text-muted-foreground">{description}</p> : null}
      </div>
    );
  }

  if (field.localized || field.type === 'localized_text') {
    const entries = Array.isArray(value) ? (value as LocalizedText) : [];
    return (
      <div className="min-w-0 space-y-3">
        <div className="space-y-1">
          <FieldMeta htmlFor={id} {...meta} />
          {description ? <p className="text-base leading-snug text-muted-foreground">{description}</p> : null}
        </div>
        <LocalizedCopyField
          id={id}
          value={entries}
          multiline={field.type === 'textarea' || field.name === 'bio'}
          maxLength={maxLength}
          uiLocale={locale}
          onChange={onChange}
        />
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <AppSwitcher
        id={id}
        label={label}
        status={field.required ? copy.required : undefined}
        description={description}
        checked={Boolean(value)}
        onCheckedChange={onChange}
        end={aside}
      />
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
          status={field.required ? copy.required : undefined}
        />
      );
    }
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset className="min-w-0 space-y-3">
        <legend className="w-full space-y-1">
          <FieldMeta {...meta} />
          {description ? <p className="text-base leading-snug text-muted-foreground">{description}</p> : null}
        </legend>
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
    const empty = copy.empty;
    const cohort = field.column_key === 'cohort_id';
    const selected = cohort ? String(value || '') || '__none__' : String(value || '') || undefined;
    return (
      <div className="min-w-0 space-y-3">
        <div className="space-y-1">
          <FieldMeta htmlFor={id} {...meta} />
          {description ? <p className="text-base leading-snug text-muted-foreground">{description}</p> : null}
        </div>
        <Select value={selected} onValueChange={(next) => onChange(cohort && next === '__none__' ? '' : next)}>
          <SelectTrigger id={id} className="w-full min-h-11">
            <SelectValue placeholder={empty} />
          </SelectTrigger>
          <SelectContent>
            {cohort ? <SelectItem value="__none__">{empty}</SelectItem> : null}
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
    <div className="min-w-0 space-y-3">
      <div className="space-y-1">
        <FieldMeta htmlFor={id} {...meta} />
        {description ? <p className="text-base leading-snug text-muted-foreground">{description}</p> : null}
      </div>
      <Field
        id={id}
        type={field.type === 'url' ? 'url' : undefined}
        className={field.type === 'textarea' ? 'min-h-32 w-full' : 'min-h-11 w-full'}
        value={String(value || '')}
        required={field.required}
        onChange={(e) => onChange(e.target.value)}
        {...(field.type === 'textarea' ? { rows: 4 } : {})}
      />
    </div>
  );
}

function FieldMeta({
  htmlFor,
  label,
  required,
  requiredLabel,
  end,
}: {
  htmlFor?: string;
  label: string;
  required: boolean;
  requiredLabel: string;
  end?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
        {htmlFor ? (
          <Label htmlFor={htmlFor} className="text-lg font-semibold leading-none text-foreground">
            {label}
          </Label>
        ) : (
          <span className="text-lg font-semibold leading-none text-foreground">{label}</span>
        )}
        {required ? <span className="text-xs text-muted-foreground">{requiredLabel}</span> : null}
      </span>
      {end ? <div className="shrink-0">{end}</div> : null}
    </div>
  );
}

function ImageControl({
  id,
  label,
  required,
  requiredLabel,
  value,
  onChange,
  initials,
}: {
  id: string;
  label: string;
  required: boolean;
  requiredLabel: string;
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
      <FieldMeta label={label} required={required} requiredLabel={requiredLabel} />
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

