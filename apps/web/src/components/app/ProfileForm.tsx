'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppPageTemplate, AppProfileSection, AppProfileStack, FieldGrid, fieldSpanClass } from '@community/ui-member';
import { Button, Skeleton, toast } from '@community/ui';
import { contentFromCatalog, pickContent, pickLocalizedText } from '@community/identity';
import { coreCatalog, missingRequiredFields, type CatalogField, type CatalogGroup } from '@community/directory';
import { useLocale } from '@/components/app/LocaleProvider';
import { FieldControl } from '@/components/app/FieldControl';
import { uiCatalog } from '@/lang/catalog';
import { cardBodyFromFields, groupsForScope, personBodyFromFields, readFieldValue } from '@/lib/profile-bindings';

function initialsFrom(value: unknown) {
  const name = typeof value === 'string' ? value.trim() : '';
  const parts = name.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

function splitIdentity(fields: CatalogField[]) {
  return {
    photos: fields.filter((field) => field.type === 'image'),
    rest: fields.filter((field) => field.type !== 'image'),
  };
}

export function ProfileForm({ scope }: { scope: 'person' | 'community' }) {
  const locale = useLocale();
  const copy = pickContent(
    contentFromCatalog(uiCatalog, 'core_identity', {
      kicker: scope === 'person' ? 'profile.kicker' : 'community.kicker',
      title: scope === 'person' ? 'profile.title' : 'community.title',
      subtitle: scope === 'person' ? 'profile.subtitle' : 'community.subtitle',
      save: 'profile.save',
      saved: 'profile.saved',
      error: 'profile.error',
      requiredMissing: 'profile.required_missing',
      pairPt: 'profile.pair_pt',
      pairEn: 'profile.pair_en',
      audience: 'profile.audience',
      audiencePrivate: 'profile.audience_private',
      audienceInternal: 'profile.audience_internal',
      audienceExternal: 'profile.audience_external',
    }),
    locale
  );
  const [groups, setGroups] = useState<CatalogGroup[]>(
    groupsForScope(coreCatalog(), scope)
  );
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const fields = useMemo(() => groups.flatMap((group) => group.fields), [groups]);

  useEffect(() => {
    Promise.all([
      fetch('/api/directory/catalog'),
      fetch('/api/profiles/me'),
      fetch('/api/memberships/me'),
    ])
      .then(async ([catalogRes, profileRes, membershipRes]) => {
        const profileJson = await profileRes.json();
        const membershipJson = membershipRes.ok ? await membershipRes.json() : { card: null };
        let nextGroups = coreCatalog();
        if (catalogRes.ok) {
          const catalogJson = await catalogRes.json();
          if (Array.isArray(catalogJson.groups) && catalogJson.groups.length) {
            nextGroups = catalogJson.groups;
          }
        }
        nextGroups = groupsForScope(nextGroups, scope);
        setGroups(nextGroups);
        const next: Record<string, unknown> = {};
        for (const field of nextGroups.flatMap((group) => group.fields)) {
          next[field.name] = readFieldValue(field, {
            profile: profileJson.profile,
            card: membershipJson.card,
          });
          if (scope === 'community' && field.storage !== 'person') {
            const card = membershipJson.card || {};
            const column = field.column_key || field.name;
            if (column === 'headline') {
              next.headline_audience = card.headline_audience || 'private';
            } else if (column === 'bio') {
              next.bio_audience = card.bio_audience || 'private';
            } else if (field.storage === 'attributes') {
              const map = card.attribute_audience || {};
              next[`audience:${field.name}`] = map[field.name] || 'private';
            }
          }
        }
        setValues(next);
        setReady(true);
      })
      .catch(() => {
        toast.error(copy.error);
        setReady(true);
      });
  }, [copy.error, scope]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missingRequiredFields(fields, values).length) {
      toast.error(copy.requiredMissing);
      return;
    }
    setSaving(true);
    if (scope === 'person') {
      const profileRes = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personBodyFromFields(fields, values, locale)),
      });
      if (!profileRes.ok) {
        const data = await profileRes.json();
        toast.error(data.error?.message || copy.error);
        setSaving(false);
        return;
      }
    } else {
      const cardRes = await fetch('/api/memberships/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardBodyFromFields(fields, values)),
      });
      if (!cardRes.ok) {
        const data = await cardRes.json();
        toast.error(data.error?.message || copy.error);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    toast.success(copy.saved);
  };

  const saveControl = (className?: string) => (
    <Button type="submit" form="profile-form" className={className} disabled={!ready || saving}>
      {copy.save}
    </Button>
  );

  const audienceKey = (field: CatalogField) => {
    const column = field.column_key || field.name;
    if (column === 'headline') {
      return 'headline_audience';
    }
    if (column === 'bio') {
      return 'bio_audience';
    }
    if (field.storage === 'attributes') {
      return `audience:${field.name}`;
    }
    return '';
  };

  const renderField = (field: CatalogField) => {
    const key = scope === 'community' ? audienceKey(field) : '';
    return (
      <div className="min-w-0 space-y-2">
        <FieldControl
          field={field}
          locale={locale}
          value={values[field.name]}
          onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))}
          pairPt={copy.pairPt}
          pairEn={copy.pairEn}
          initials={initialsFrom(values.full_name)}
        />
        {key ? (
          <label className="block min-w-0 text-sm text-muted-foreground">
            <span className="mb-1 block">{copy.audience}</span>
            <select
              className="h-11 w-full max-w-full rounded-md border border-input bg-background px-3"
              value={String(values[key] || 'private')}
              onChange={(event) =>
                setValues((current) => ({ ...current, [key]: event.target.value }))
              }
            >
              <option value="private">{copy.audiencePrivate}</option>
              <option value="internal">{copy.audienceInternal}</option>
              <option value="external">{copy.audienceExternal}</option>
            </select>
          </label>
        ) : null}
      </div>
    );
  };

  return (
    <AppPageTemplate
      kicker={copy.kicker}
      title={copy.title}
      subtitle={copy.subtitle || undefined}
      stickyHeader
      actions={saveControl('min-h-11')}
    >
      {ready ? (
        <form id="profile-form" onSubmit={handleSave} className="min-w-0">
          <AppProfileStack>
            {groups.map((group) => {
              const title = pickLocalizedText(group.label, locale) || group.slug;
              const identity = group.slug === 'identity' ? splitIdentity(group.fields) : null;
              return (
                <AppProfileSection key={group.slug} title={title}>
                  {identity && identity.photos.length ? (
                    <div className="flex min-w-0 flex-col gap-6 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-6">
                      {identity.photos.map((field) => (
                        <div key={field.name} className="shrink-0">
                          {renderField(field)}
                        </div>
                      ))}
                      <div className="min-w-0 w-full flex-1">
                        {identity.rest.map((field) => (
                          <div key={field.name} className="min-w-0">
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <FieldGrid columns={group.columns}>
                      {group.fields.map((field: CatalogField) => (
                        <div key={field.name} className={fieldSpanClass(field.span, group.columns)}>
                          {renderField(field)}
                        </div>
                      ))}
                    </FieldGrid>
                  )}
                </AppProfileSection>
              );
            })}
          </AppProfileStack>
        </form>
      ) : (
        <div className="space-y-8" aria-hidden>
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="h-11 w-full max-w-md" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
    </AppPageTemplate>
  );
}
