'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Pencil, Plus, Sparkles, Star, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from '@community/ui';
import {
  AppAlertDialog,
  AppDialog,
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
} from '@community/ui-member';
import { AudienceMark } from '@/components/app/AudienceMark';
import { contentFromCatalog, pickContent, pickLocalizedText, type LocalizedText } from '@community/identity';
import { parseAudience, type Exposure } from '@community/directory';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';
import { offeringCategoryDisplay } from '@/lib/people/offering-label';

type Offer = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  category_id: string;
  category_other: string | null;
  audience: string;
  featured_on_card?: boolean;
};

type CategoryOption = { id: string; label: LocalizedText; allowsOtherText: boolean };

const EMPTY_DRAFT = {
  title: '',
  description: '',
  url: '',
  categoryId: '',
  categoryOther: '',
  audience: 'internal',
};

function parseCeiling(raw: unknown): Exposure {
  return raw === 'hidden' || raw === 'internal' || raw === 'external' ? raw : 'internal';
}

export function TalentOffers({ heading = true }: { heading?: boolean }) {
  const locale = useLocale();
  const copy = pickContent(
    contentFromCatalog(uiCatalog, 'core_identity', {
      title: 'talent.title',
      subtitle: 'talent.subtitle',
      emptyState: 'talent.empty',
      add: 'talent.add',
      editTitle: 'talent.edit_title',
      deleteConfirm: 'talent.delete_confirm',
      saved: 'talent.saved',
      deleted: 'talent.deleted',
      offerTitle: 'talent.offer_title',
      description: 'talent.description',
      link: 'talent.link',
      category: 'talent.category',
      other: 'talent.other',
      save: 'talent.save',
      edit: 'talent.edit',
      remove: 'talent.remove',
      featured: 'talent.featured_on_card',
      featuredActive: 'talent.featured_on_card_active',
      audience: 'profile.audience',
      audiencePrivate: 'profile.audience_private',
      audienceInternal: 'profile.audience_internal',
      audienceExternal: 'profile.audience_external',
      empty: 'profile.select_empty',
      error: 'profile.error',
      cancel: 'profile.cancel',
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
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);
  const [ceiling, setCeiling] = useState<Exposure>('internal');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

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

  function openCreate() {
    setEditing(null);
    setDraft({ ...EMPTY_DRAFT, categoryId: categories[0]?.id || '' });
    setFormError('');
    setOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditing(offer.id);
    setDraft({
      title: offer.title,
      description: offer.description,
      url: offer.url ?? '',
      categoryId: offer.category_id,
      categoryOther: offer.category_other ?? '',
      audience: offer.audience,
    });
    setFormError('');
    setOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const response = await fetch(editing ? `/api/talent/offerings/${editing}` : '/api/talent/offerings', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg = data.error?.message || copy.error;
        setFormError(msg);
        toast.error(msg);
        return;
      }
      setDraft({ ...EMPTY_DRAFT, categoryId: categories[0]?.id || '' });
      setEditing(null);
      setOpen(false);
      await load();
      toast.success(copy.saved);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const response = await fetch(`/api/talent/offerings/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast.error(data.error?.message || copy.error);
      return;
    }
    setDeleteTarget(null);
    await load();
    toast.success(copy.deleted);
  }

  async function setFeatured(id: string) {
    const response = await fetch(`/api/talent/offerings/${id}/featured`, { method: 'POST' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast.error(data.error?.message || copy.error);
      return;
    }
    await load();
  }

  return (
    <section className="mt-10 w-full min-w-0 space-y-5 border-t border-border/70 pt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          {heading ? <h2 className="text-xl font-semibold tracking-tight">{copy.title}</h2> : null}
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          {copy.add}
        </Button>
      </div>

      {offers.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Sparkles className="size-7 text-muted-foreground/60" />
            <p className="max-w-md text-sm text-muted-foreground">{copy.emptyState}</p>
            <Button type="button" variant="outline" size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {copy.add}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {offers.map((offer) => {
            const cat = categories.find((c) => c.id === offer.category_id);
            const categoryText = offeringCategoryDisplay(
              {
                title: offer.title,
                category_id: offer.category_id,
                category_other: offer.category_other ?? undefined,
              },
              locale,
              categories
            );
            return (
              <Card
                key={offer.id}
                className={`flex min-w-0 flex-col justify-between transition-colors ${
                  offer.featured_on_card ? 'border-primary/40 bg-primary/[0.02]' : ''
                }`}
              >
                <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <div className="min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {categoryText}
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                          {audienceLabels[parseAudience(offer.audience)]}
                        </span>
                      </div>
                      {offer.featured_on_card ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          <Star className="size-3 fill-current" />
                          {copy.featuredActive}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-base font-semibold leading-snug break-words">{offer.title}</h3>

                    {offer.description ? (
                      <p className="text-sm leading-relaxed text-muted-foreground break-words">
                        {offer.description}
                      </p>
                    ) : null}

                    {offer.url ? (
                      <div>
                        <a
                          href={offer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <ExternalLink className="size-3 shrink-0" />
                          <span className="truncate">{offer.url.replace(/^https?:\/\//, '')}</span>
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant={offer.featured_on_card ? 'secondary' : 'outline'}
                      disabled={offer.featured_on_card}
                      onClick={() => void setFeatured(offer.id)}
                    >
                      <Star className={`size-3.5 ${offer.featured_on_card ? 'fill-current' : ''}`} />
                      {offer.featured_on_card ? copy.featuredActive : copy.featured}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={copy.edit}
                        onClick={() => openEdit(offer)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={copy.remove}
                        onClick={() => setDeleteTarget(offer)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AppDialog open={open} onClose={() => setOpen(false)} size="md">
        <AppDialogHeader title={editing ? copy.editTitle : copy.add} />
        <AppDialogBody>
          <form id="talent-offer-form" onSubmit={save} className="grid min-w-0 gap-4">
            {formError ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {formError}
              </p>
            ) : null}
            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor="talent-title">{copy.offerTitle}</Label>
              <Input
                id="talent-title"
                required
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </div>
            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor="talent-category">{copy.category}</Label>
              <Select
                value={draft.categoryId || undefined}
                onValueChange={(next) => setDraft({ ...draft, categoryId: next })}
              >
                <SelectTrigger id="talent-category" className="w-full">
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
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="talent-other">{copy.other}</Label>
                <Input
                  id="talent-other"
                  required
                  value={draft.categoryOther}
                  onChange={(event) => setDraft({ ...draft, categoryOther: event.target.value })}
                />
              </div>
            ) : null}
            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor="talent-desc">{copy.description}</Label>
              <Textarea
                id="talent-desc"
                rows={4}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </div>
            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor="talent-link">{copy.link}</Label>
              <Input
                id="talent-link"
                type="url"
                placeholder="https://..."
                value={draft.url}
                onChange={(event) => {
                  setFormError('');
                  setDraft({ ...draft, url: event.target.value });
                }}
              />
            </div>
            <AudienceMark
              value={draft.audience}
              ceiling={ceiling}
              labels={audienceLabels}
              label={copy.audience}
              onChange={(audience) => setDraft({ ...draft, audience })}
            />
          </form>
        </AppDialogBody>
        <AppDialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {copy.cancel || 'Cancelar'}
          </Button>
          <Button type="submit" form="talent-offer-form" disabled={saving}>
            {copy.save}
          </Button>
        </AppDialogFooter>
      </AppDialog>

      <AppAlertDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={copy.deleteConfirm}
        description={deleteTarget?.title || ''}
        confirmLabel={copy.remove}
        cancelLabel={copy.cancel || 'Cancelar'}
        confirmVariant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            void remove(deleteTarget.id);
          }
        }}
      />
    </section>
  );
}
