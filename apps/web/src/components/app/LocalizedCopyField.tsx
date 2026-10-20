'use client';

import { useState } from 'react';
import { Input, Textarea } from '@community/ui';
import type { LocalizedText } from '@community/identity';

const LOCALES = [
  { id: 'pt-BR' as const, label: 'Português' },
  { id: 'en' as const, label: 'English' },
];

function textAt(entries: LocalizedText, locale: 'pt-BR' | 'en') {
  return entries.find((entry) => entry.locale === locale)?.value || '';
}

function withLocale(entries: LocalizedText, locale: 'pt-BR' | 'en', next: string): LocalizedText {
  const rest = entries.filter((entry) => entry.locale !== locale);
  return next.trim() ? [...rest, { locale, value: next }] : rest;
}

export function LocalizedCopyField({
  id,
  value,
  onChange,
  multiline,
  maxLength,
  uiLocale,
}: {
  id: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline: boolean;
  maxLength?: number;
  uiLocale: string;
}) {
  const [locale, setLocale] = useState<'pt-BR' | 'en'>(uiLocale === 'en' ? 'en' : 'pt-BR');
  const current = textAt(value, locale);
  const Field = multiline ? Textarea : Input;
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div role="tablist" className="inline-flex items-center gap-3">
          {LOCALES.map((item) => {
            const selected = locale === item.id;
            const empty = !textAt(value, item.id).trim();
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`inline-flex min-h-8 items-center gap-1.5 border-b-2 text-sm ${selected ? 'border-foreground font-medium text-foreground' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setLocale(item.id)}
              >
                {item.label}
                {empty ? <span className="size-1.5 rounded-full bg-muted-foreground/70" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
        {maxLength ? (
          <p className="text-xs tabular-nums text-muted-foreground">
            {current.length}/{maxLength}
          </p>
        ) : null}
      </div>
      <Field
        id={id}
        className={multiline ? 'min-h-28 w-full' : 'min-h-11 w-full'}
        value={current}
        maxLength={maxLength}
        {...(multiline ? { rows: 4 } : {})}
        onChange={(event) => onChange(withLocale(value, locale, event.target.value))}
      />
    </div>
  );
}
