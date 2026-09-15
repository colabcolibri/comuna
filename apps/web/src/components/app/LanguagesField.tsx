'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@community/ui';
import {
  contentFromCatalog,
  interpolate,
  parseLanguages,
  pickContent,
  pickLocalizedText,
  PROFICIENCIES,
  type Proficiency,
  type SpokenLanguage,
} from '@community/identity';
import type { CatalogField } from '@community/directory';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_identity', {
  empty: 'profile.languages_empty',
  language: 'profile.language',
  add: 'profile.languages_add',
  saveItem: 'profile.languages_save_item',
  cancel: 'profile.languages_cancel',
  remove: 'profile.languages_remove',
  edit: 'profile.languages_edit',
  full: 'profile.languages_full',
  pick: 'profile.languages_pick',
  proficiency: 'profile.proficiency',
  proficiency_basic: 'profile.proficiency_basic',
  proficiency_intermediate: 'profile.proficiency_intermediate',
  proficiency_fluent: 'profile.proficiency_fluent',
  proficiency_native: 'profile.proficiency_native',
});

export function LanguagesField({
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
  const [draftCode, setDraftCode] = useState('');
  const [draftLevel, setDraftLevel] = useState<Proficiency>('fluent');
  const [editing, setEditing] = useState<string | null>(null);

  const taken = new Set(selected.map((item) => item.code).filter((code) => code !== editing));
  const available = field.options.filter((option) => !taken.has(option.value));
  const nameOf = (code: string) =>
    pickLocalizedText(field.options.find((option) => option.value === code)?.label || [], locale) || code;

  function resetDraft() {
    setDraftCode('');
    setDraftLevel('fluent');
    setEditing(null);
  }

  function submitDraft() {
    if (!draftCode || !available.some((option) => option.value === draftCode)) {
      return;
    }
    const next: SpokenLanguage = { code: draftCode, proficiency: draftLevel };
    if (editing) {
      onChange(selected.map((item) => (item.code === editing ? next : item)));
    } else {
      onChange([...selected, next]);
    }
    resetDraft();
  }

  return (
    <fieldset className="space-y-3 min-w-0">
      <legend className="text-sm font-medium">{label}</legend>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}

      {selected.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {selected.map((item) => {
            const name = nameOf(item.code);
            return (
              <li key={item.code} className="flex min-w-0 items-center gap-3 px-3 py-2.5 sm:px-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{name}</p>
                  <p className="truncate text-sm text-muted-foreground">{levels[item.proficiency]}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label={interpolate(copy.edit, { name })}
                    onClick={() => {
                      setEditing(item.code);
                      setDraftCode(item.code);
                      setDraftLevel(item.proficiency);
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 text-destructive hover:text-destructive"
                    aria-label={interpolate(copy.remove, { name })}
                    onClick={() => {
                      onChange(selected.filter((row) => row.code !== item.code));
                      if (editing === item.code) {
                        resetDraft();
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {available.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.full}</p>
      ) : (
        <div className="min-w-0 space-y-3 rounded-xl border border-dashed border-border p-3 sm:p-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor={`${field.name}-code`}>{copy.language}</Label>
              <Select value={draftCode || undefined} onValueChange={setDraftCode}>
                <SelectTrigger id={`${field.name}-code`} className="w-full min-h-11">
                  <SelectValue placeholder={copy.pick} />
                </SelectTrigger>
                <SelectContent>
                  {available.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {pickLocalizedText(option.label, locale) || option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-2 sm:w-44">
              <Label htmlFor={`${field.name}-level`}>{copy.proficiency}</Label>
              <Select value={draftLevel} onValueChange={(level) => setDraftLevel(level as Proficiency)}>
                <SelectTrigger id={`${field.name}-level`} className="w-full min-h-11">
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
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="min-h-11 w-full sm:w-auto"
                disabled={!draftCode}
                onClick={submitDraft}
              >
                {editing ? copy.saveItem : copy.add}
              </Button>
              {editing ? (
                <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={resetDraft}>
                  {copy.cancel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}
