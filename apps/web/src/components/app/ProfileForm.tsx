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

  const renderField = (field: CatalogField) => (
    <FieldControl
      field={field}
      locale={locale}
      value={values[field.name]}
      onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))}
      pairPt={copy.pairPt}
      pairEn={copy.pairEn}
      initials={initialsFrom(values.full_name)}
    />
  );

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
