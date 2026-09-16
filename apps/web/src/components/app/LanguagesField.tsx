'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@community/ui';
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogHeader } from '@community/ui-member';
import {
  contentFromCatalog,
  interpolate,
  parseLanguages,
  pickContent,
  pickLocalizedText,
  PROFICIENCIES,
  sortSpokenLanguages,
  spokenLanguageOptions,
  type Proficiency,
  type SpokenLanguage,
} from '@community/identity';
import type { CatalogField } from '@community/directory';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_identity', {
  empty: 'profile.languages_empty',
  language: 'profile.language',
  addNew: 'profile.languages_add_new',
  add: 'profile.languages_add',
  addTitle: 'profile.languages_add_title',
  editTitle: 'profile.languages_edit_title',
  help: 'profile.languages_help',
  saveItem: 'profile.languages_save_item',
  cancel: 'profile.languages_cancel',
  remove: 'profile.languages_remove',
  edit: 'profile.languages_edit',
  full: 'profile.languages_full',
  pick: 'profile.languages_pick',
  proficiency: 'profile.proficiency',
  proficiency_basic: 'profile.proficiency_basic',
  proficiency_intermediate: 'profile.proficiency_intermediate',
  proficiency_advanced: 'profile.proficiency_advanced',
  proficiency_fluent: 'profile.proficiency_fluent',
  proficiency_native: 'profile.proficiency_native',
});

export function LanguagesField({
  field,
  locale,
  value,
  onChange,
  status,
}: {
  field: CatalogField;
  locale: string;
  value: unknown;
  onChange: (value: unknown) => void;
  status?: string;
}) {
  const label = pickLocalizedText(field.label, locale) || field.name;
  const description = pickLocalizedText(field.description, locale);
  const copy = pickContent(CONTENT, locale);
  const selected = sortSpokenLanguages(parseLanguages(value), locale);
  const levels: Record<Proficiency, string> = {
    basic: copy.proficiency_basic,
    intermediate: copy.proficiency_intermediate,
    advanced: copy.proficiency_advanced,
    fluent: copy.proficiency_fluent,
    native: copy.proficiency_native,
  };
  const [open, setOpen] = useState(false);
  const [draftCode, setDraftCode] = useState('');
  const [draftLevel, setDraftLevel] = useState<Proficiency>('fluent');
  const [editing, setEditing] = useState<string | null>(null);

  const taken = new Set(selected.map((item) => item.code).filter((code) => code !== editing));
  const available = spokenLanguageOptions(locale)
    .filter((option) => !taken.has(option.value))
    .map((option) => field.options.find((row) => row.value === option.value))
    .filter((option): option is CatalogField['options'][number] => Boolean(option));
  const nameOf = (code: string) =>
    pickLocalizedText(field.options.find((option) => option.value === code)?.label || [], locale) || code;

  function closeDialog() {
    setOpen(false);
    setDraftCode('');
    setDraftLevel('fluent');
    setEditing(null);
  }

  function openAdd() {
    setEditing(null);
    setDraftCode('');
    setDraftLevel('fluent');
    setOpen(true);
  }

  function openEdit(item: SpokenLanguage) {
    setEditing(item.code);
    setDraftCode(item.code);
    setDraftLevel(item.proficiency);
    setOpen(true);
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
    closeDialog();
  }

  return (
    <div className="space-y-2 min-w-0">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
        <Label>{label}</Label>
        {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
      </div>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}

      {selected.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="overflow-hidden rounded-md border border-input">
          {selected.map((item) => {
            const name = nameOf(item.code);
            return (
              <li
                key={item.code}
                className="flex min-h-11 min-w-0 items-center gap-2 border-b border-input px-3 last:border-b-0"
              >
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{name}</span>
                  <span className="shrink-0 text-sm text-muted-foreground">{levels[item.proficiency]}</span>
                </div>
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label={interpolate(copy.edit, { name })}
                    onClick={() => openEdit(item)}
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
                        closeDialog();
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

      {available.length > 0 && !open ? (
        <Button type="button" variant="outline" className="min-h-11 w-full" onClick={openAdd}>
          {copy.addNew}
        </Button>
      ) : null}
      {available.length === 0 && !open ? (
        <p className="text-sm text-muted-foreground">{copy.full}</p>
      ) : null}

      <AppDialog open={open} onClose={closeDialog} size="sm">
        <AppDialogHeader title={editing ? copy.editTitle : copy.addTitle} description={copy.help} />
        <AppDialogBody>
          <div className="space-y-4">
            <div className="space-y-2 min-w-0">
              <Label htmlFor={`${field.name}-code`}>{copy.language}</Label>
              <Select key={editing ?? 'add'} value={draftCode || undefined} onValueChange={setDraftCode}>
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
            <div className="space-y-2 min-w-0">
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
          </div>
        </AppDialogBody>
        <AppDialogFooter>
          <Button type="button" variant="outline" className="min-h-11" onClick={closeDialog}>
            {copy.cancel}
          </Button>
          <Button type="button" className="min-h-11" disabled={!draftCode} onClick={submitDraft}>
            {editing ? copy.saveItem : copy.add}
          </Button>
        </AppDialogFooter>
      </AppDialog>
    </div>
  );
}
