'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AppPageTemplate,
  AppProfileItem,
  AppProfileSection,
  AppProfileStack,
  AppSwitcher,
  FieldGrid,
  fieldSpanClass,
} from '@community/ui-member';
import { Button, Skeleton, toast } from '@community/ui';
import { contentFromCatalog, pickContent, pickLocalizedText } from '@community/identity';
import {
  communityAllowsShowcaseListing,
  communityCopyLimit,
  coreCatalog,
  missingRequiredFields,
  resolveMemberAudience,
  defaultMemberAudience,
  type CatalogField,
  type CatalogGroup,
} from '@community/directory';
import { AudienceMark } from '@/components/app/AudienceMark';
import { useLocale } from '@/components/app/LocaleProvider';
import { FieldControl } from '@/components/app/FieldControl';
import { uiCatalog } from '@/lang/catalog';
import { cardBodyFromFields, groupsForScope, personBodyFromFields, readFieldValue } from '@/lib/profile-bindings';
import { ProfileVisibilityNotice } from '@/components/app/ProfileVisibilityNotice';
import type { ListingHint } from '@community/directory';

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

export function ProfileForm({
  scope,
  embedded = false,
  extra,
}: {
  scope: 'person' | 'community';
  embedded?: boolean;
  extra?: ReactNode;
}) {
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
  const [listingHints, setListingHints] = useState<ListingHint[]>([]);
  const [showcaseModuleOn, setShowcaseModuleOn] = useState(false);
  const fields = useMemo(() => groups.flatMap((group) => group.fields), [groups]);
  const showcaseListingAllowed = useMemo(() => communityAllowsShowcaseListing(fields), [fields]);
  const showcaseCopy = pickContent(
    contentFromCatalog(uiCatalog, 'plugin_directory', {
      showcaseLabel: 'card.showcase',
      showcaseDescription: 'card.showcase_description',
    }),
    locale
  );

  useEffect(() => {
    Promise.all([
      fetch('/api/directory/catalog'),
      fetch('/api/profiles/me'),
      fetch('/api/memberships/me'),
    ])
      .then(async ([catalogRes, profileRes, membershipRes]) => {
        const profileJson = await profileRes.json();
        const membershipJson = membershipRes.ok ? await membershipRes.json() : { card: null, listing: [] };
        if (scope === 'community') {
          if (Array.isArray(membershipJson.listing)) {
            setListingHints(membershipJson.listing);
          }
          setShowcaseModuleOn(membershipJson.modules?.showcase === true);
        }
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
            membership: membershipJson.membership,
          });
          if (scope === 'community' && field.storage !== 'person') {
            const card = membershipJson.card || {};
            const column = field.column_key || field.name;
            if (column === 'headline') {
              next.headline_audience = resolveMemberAudience(card.headline_audience, field.exposure) ?? 'internal';
            } else if (column === 'bio') {
              next.bio_audience = resolveMemberAudience(card.bio_audience, field.exposure) ?? 'internal';
            } else if (field.storage === 'attributes') {
              const map = card.attribute_audience || {};
              next[`audience:${field.name}`] =
                resolveMemberAudience(map[field.name], field.exposure) ?? defaultMemberAudience(field.exposure);
            }
          }
        }
        if (scope === 'community') {
          const card = membershipJson.card || {};
          next.public_showcase = card.public_showcase === true;
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
    if (scope === 'community') {
      const refreshed = await fetch('/api/memberships/me');
      if (refreshed.ok) {
        const json = await refreshed.json();
        if (Array.isArray(json.listing)) {
          setListingHints(json.listing);
        }
      }
    }
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
      <AppProfileItem>
        <FieldControl
          field={field}
          locale={locale}
          value={values[field.name]}
          onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))}
          initials={initialsFrom(values.full_name)}
          maxLength={communityCopyLimit(field.column_key)}
          aside={
            key ? (
              <AudienceMark
                value={String(values[key] || defaultMemberAudience(field.exposure))}
                ceiling={field.exposure}
                label={copy.audience}
                labels={{ private: copy.audiencePrivate, internal: copy.audienceInternal, external: copy.audienceExternal }}
                onChange={(next) => setValues((current) => ({ ...current, [key]: next }))}
              />
            ) : null
          }
        />
      </AppProfileItem>
    );
  };

  const form = (
    <>
      {ready ? (
        <form id="profile-form" onSubmit={handleSave} className="min-w-0">
          <AppProfileStack>
            {groups.map((group) => {
              const title = pickLocalizedText(group.label, locale) || group.slug;
              const description = pickLocalizedText(group.description, locale);
              const identity = group.slug === 'identity' ? splitIdentity(group.fields) : null;
              return (
                <AppProfileSection key={group.slug} title={title} description={description || undefined}>
                  {identity && identity.photos.length ? (
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
                      {identity.photos.map((field) => (
                        <div key={field.name} className="shrink-0">
                          {renderField(field)}
                        </div>
                      ))}
                      <div className="flex min-w-0 w-full flex-1 flex-col gap-3">
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
    </>
  );

  if (embedded) {
    return form;
  }

  return (
    <AppPageTemplate
      kicker={copy.kicker}
      title={copy.title}
      subtitle={copy.subtitle || undefined}
      stickyHeader
      actions={saveControl('min-h-11')}
    >
      {scope === 'community' && listingHints.length ? <ProfileVisibilityNotice hints={listingHints} /> : null}
      {scope === 'community' && showcaseModuleOn && showcaseListingAllowed ? (
        <div className="mb-8 min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6">
          <AppSwitcher
            id="profile-public-showcase"
            label={showcaseCopy.showcaseLabel}
            description={showcaseCopy.showcaseDescription}
            checked={values.public_showcase === true}
            onCheckedChange={(checked) => setValues((current) => ({ ...current, public_showcase: checked }))}
          />
        </div>
      ) : null}
      {form}
      {extra}
    </AppPageTemplate>
  );
}
