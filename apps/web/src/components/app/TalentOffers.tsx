'use client';

import { useEffect, useState } from 'react';
import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@community/ui';
import { AudienceMark } from '@/components/app/AudienceMark';
import { contentFromCatalog, pickContent } from '@community/identity';
import { pickLocalizedText, type LocalizedText } from '@community/identity';
import { parseAudience, type Exposure } from '@community/directory';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

type Offer = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  category_id: string;
  category_other: string | null;
  audience: string;
};

type CategoryOption = { id: string; label: LocalizedText; allowsOtherText: boolean };

const EMPTY_DRAFT = {
  title: '',
  description: '',
  url: '',
  categoryId: '',
  categoryOther: '',
  audience: 'private',
};

function parseCeiling(raw: unknown): Exposure {
  return raw === 'hidden' || raw === 'internal' || raw === 'external' ? raw : 'internal';
}

export function TalentOffers({ heading = true }: { heading?: boolean }) {
  const locale = useLocale();
  const copy = pickContent(
    contentFromCatalog(uiCatalog, 'core_identity', {
      title: 'talent.title',
      add: 'talent.add',
      offerTitle: 'talent.offer_title',
      description: 'talent.description',
      link: 'talent.link',
      category: 'talent.category',
      other: 'talent.other',
      save: 'talent.save',
      edit: 'talent.edit',
      remove: 'talent.remove',
      audience: 'profile.audience',
      audiencePrivate: 'profile.audience_private',
      audienceInternal: 'profile.audience_internal',
      audienceExternal: 'profile.audience_external',
      empty: 'profile.select_empty',
    }),
    locale
  );
  const audienceLabels = {
    private: copy.audiencePrivate,
    internal: copy.audienceInternal,
    external: copy.audienceExternal,
  };
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [ceiling, setCeiling] = useState<Exposure>('internal');

  async function load() {
    const response = await fetch('/api/talent/offerings');
    if (response.status === 404) {
      setOffers(null);
      return;
    }
    const body = await response.json();
    setCeiling(parseCeiling(body.ceiling));
    setOffers(Array.isArray(body.data) ? body.data : []);
    const nextCategories = Array.isArray(body.categories) ? body.categories : [];
    setCategories(nextCategories);
    const firstId = nextCategories[0]?.id || '';
    setDraft((value) => (value.categoryId ? value : { ...value, categoryId: firstId }));
  }

  useEffect(() => {
    load().catch(() => setOffers(null));
  }, []);

  if (offers === null) {
    return null;
  }

  const selectedCategory = categories.find((item) => item.id === draft.categoryId);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(editing ? `/api/talent/offerings/${editing}` : '/api/talent/offerings', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      return;
    }
    setDraft({ ...EMPTY_DRAFT, categoryId: categories[0]?.id || '' });
    setEditing(null);
    setOpen(false);
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/talent/offerings/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <section className="mt-12 w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {heading ? <h2 className="text-2xl font-semibold tracking-tight">{copy.title}</h2> : <span />}
        <Button type="button" className="min-h-11" onClick={() => setOpen((value) => !value)}>
          {copy.add}
        </Button>
      </div>
      {open ? (
        <form onSubmit={save} className="grid min-w-0 gap-4 rounded-xl border border-border p-4">
          <label className="grid min-w-0 gap-2 text-sm">
            <Label>{copy.offerTitle}</Label>
            <input
              required
              className="h-11 w-full rounded-md border border-input bg-background px-3"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm">
            <Label>{copy.description}</Label>
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm">
            <Label>{copy.link}</Label>
            <input
              className="h-11 w-full rounded-md border border-input bg-background px-3"
              value={draft.url}
              onChange={(event) => setDraft({ ...draft, url: event.target.value })}
            />
          </label>
          <div className="min-w-0 space-y-2">
            <Label>{copy.category}</Label>
            <Select value={draft.categoryId || undefined} onValueChange={(next) => setDraft({ ...draft, categoryId: next })}>
              <SelectTrigger className="min-h-11 w-full">
                <SelectValue placeholder={copy.empty} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {pickLocalizedText(item.label, locale) || item.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCategory?.allowsOtherText ? (
            <label className="grid min-w-0 gap-2 text-sm">
              <Label>{copy.other}</Label>
              <input
                required
                className="h-11 w-full rounded-md border border-input bg-background px-3"
                value={draft.categoryOther}
                onChange={(event) => setDraft({ ...draft, categoryOther: event.target.value })}
              />
            </label>
          ) : null}
          <AudienceMark
            value={draft.audience}
            ceiling={ceiling}
            labels={audienceLabels}
            label={copy.audience}
            onChange={(audience) => setDraft({ ...draft, audience })}
          />
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            {copy.save}
          </Button>
        </form>
      ) : null}
      <ul className="grid min-w-0 gap-3">
        {offers.map((offer) => (
          <li key={offer.id} className="min-w-0 rounded-xl border border-border p-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium break-words">{offer.title}</p>
                {offer.description ? (
                  <p className="mt-2 break-words text-sm text-muted-foreground">{offer.description}</p>
                ) : null}
                {offer.url ? (
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block break-all text-sm underline"
                  >
                    {offer.url}
                  </a>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="text-xs text-muted-foreground">
                  {copy.audience}: {audienceLabels[parseAudience(offer.audience)]}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                      setEditing(offer.id);
                      setOpen(true);
                      setDraft({
                        title: offer.title,
                        description: offer.description || '',
                        url: offer.url || '',
                        categoryId: offer.category_id,
                        categoryOther: offer.category_other || '',
                        audience: offer.audience,
                      });
                    }}
                  >
                    {copy.edit}
                  </Button>
                  <Button type="button" variant="outline" className="min-h-11" onClick={() => remove(offer.id)}>
                    {copy.remove}
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
