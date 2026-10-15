'use client';

import { useEffect, useState } from 'react';
import { Button } from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { TALENT_CATEGORIES } from '@community/talent';
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

const EMPTY = {
  title: '',
  description: '',
  url: '',
  categoryId: 'mentorship',
  categoryOther: '',
  audience: 'private',
};

export function TalentOffers() {
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
    }),
    locale
  );
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [ceiling, setCeiling] = useState<'hidden' | 'internal' | 'external'>('internal');

  async function load() {
    const response = await fetch('/api/talent/offerings');
    if (response.status === 404) {
      setOffers(null);
      return;
    }
    const body = await response.json();
    setCeiling(body.ceiling === 'hidden' || body.ceiling === 'external' ? body.ceiling : 'internal');
    setOffers(Array.isArray(body.data) ? body.data : []);
  }

  useEffect(() => {
    load().catch(() => setOffers(null));
  }, []);

  if (offers === null) {
    return null;
  }

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
    setDraft(EMPTY);
    setEditing(null);
    setOpen(false);
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/talent/offerings/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <section className="mx-auto mt-8 w-full min-w-0 max-w-3xl space-y-4 px-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{copy.title}</h2>
        <Button type="button" className="min-h-11" onClick={() => setOpen((value) => !value)}>
          {copy.add}
        </Button>
      </div>
      {open ? (
        <form onSubmit={save} className="grid min-w-0 gap-3 rounded-xl border border-border p-4">
          <label className="grid gap-1 text-sm">
            {copy.offerTitle}
            <input
              required
              className="h-11 w-full rounded-md border border-input bg-background px-3"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            {copy.description}
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            {copy.link}
            <input
              className="h-11 w-full rounded-md border border-input bg-background px-3"
              value={draft.url}
              onChange={(event) => setDraft({ ...draft, url: event.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            {copy.category}
            <select
              className="h-11 w-full rounded-md border border-input bg-background px-3"
              value={draft.categoryId}
              onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}
            >
              {TALENT_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label[locale === 'en' ? 'en' : 'pt-BR']}
                </option>
              ))}
            </select>
          </label>
          {draft.categoryId === 'other' ? (
            <label className="grid gap-1 text-sm">
              {copy.other}
              <input
                required
                className="h-11 w-full rounded-md border border-input bg-background px-3"
                value={draft.categoryOther}
                onChange={(event) => setDraft({ ...draft, categoryOther: event.target.value })}
              />
            </label>
          ) : null}
          <div className="flex min-w-0 flex-wrap gap-1">
            {(['private', 'internal', 'external'] as const)
              .filter((item) => (ceiling === 'internal' ? item !== 'external' : true))
              .map((item) => (
                <button
                  key={item}
                  type="button"
                  title={item === 'private' ? copy.audiencePrivate : item === 'internal' ? copy.audienceInternal : copy.audienceExternal}
                  aria-pressed={draft.audience === item}
                  className={`inline-flex size-9 items-center justify-center rounded-md border text-sm ${draft.audience === item ? 'border-foreground' : 'border-input'}`}
                  onClick={() => setDraft({ ...draft, audience: item })}
                >
                  {item === 'private' ? '🔒' : item === 'internal' ? '👥' : '🌐'}
                </button>
              ))}
          </div>
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            {copy.save}
          </Button>
        </form>
      ) : null}
      <ul className="grid min-w-0 gap-3">
        {offers.map((offer) => (
          <li key={offer.id} className="min-w-0 rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-medium break-words">{offer.title}</p>
              <div className="flex gap-2">
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
            {offer.description ? <p className="mt-2 break-words text-sm text-muted-foreground">{offer.description}</p> : null}
            {offer.url ? (
              <a href={offer.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block break-all text-sm underline">
                {offer.url}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
