'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppPageTemplate, FieldGrid, fieldSpanClass } from '@community/ui-member';
import { Button, toast } from '@community/ui';
import { contentFromCatalog, pickContent, pickLocalizedText } from '@community/identity';
import { coreCatalog, type CatalogField, type CatalogGroup } from '@community/directory';
import { useLocale } from '@/components/app/LocaleProvider';
import { FieldControl } from '@/components/app/FieldControl';
import { uiCatalog } from '@/lang/catalog';
import { cardBodyFromFields, personBodyFromFields, readFieldValue } from '@/lib/profile-bindings';

const CONTENT = contentFromCatalog(uiCatalog, 'core_identity', {
  kicker: 'profile.kicker',
  title: 'profile.title',
  subtitle: 'profile.subtitle',
  save: 'profile.save',
  saved: 'profile.saved',
  error: 'profile.error',
  pairPt: 'profile.pair_pt',
  pairEn: 'profile.pair_en',
});

export default function ProfileEditPage() {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [groups, setGroups] = useState<CatalogGroup[]>(coreCatalog());
  const [values, setValues] = useState<Record<string, unknown>>({});

  const fields = useMemo(() => groups.flatMap((group) => group.fields), [groups]);

  useEffect(() => {
    Promise.all([
      fetch('/api/directory/catalog'),
      fetch('/api/profiles/me'),
      fetch('/api/memberships/me'),
    ]).then(async ([catalogRes, profileRes, membershipRes]) => {
      const profileJson = await profileRes.json();
      const membershipJson = await membershipRes.json();
      let nextGroups = coreCatalog();
      if (catalogRes.ok) {
        const catalogJson = await catalogRes.json();
        if (Array.isArray(catalogJson.groups) && catalogJson.groups.length) {
          nextGroups = catalogJson.groups;
        }
      }
      setGroups(nextGroups);
      const next: Record<string, unknown> = {};
      for (const field of nextGroups.flatMap((group) => group.fields)) {
        next[field.name] = readFieldValue(field, {
          profile: profileJson.profile,
          card: membershipJson.card,
        });
      }
      setValues(next);
    }).catch(() => toast.error(copy.error));
  }, [copy.error]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileRes = await fetch('/api/profiles/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personBodyFromFields(fields, values, locale)),
    });
    if (!profileRes.ok) {
      const data = await profileRes.json();
      toast.error(data.error?.message || copy.error);
      return;
    }
    const writesCard = fields.some((field) => field.storage !== 'person');
    if (writesCard) {
      const cardRes = await fetch('/api/memberships/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardBodyFromFields(fields, values)),
      });
      if (!cardRes.ok) {
        const data = await cardRes.json();
        toast.error(data.error?.message || copy.error);
        return;
      }
    }
    toast.success(copy.saved);
  };

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      <form onSubmit={handleSave} className="space-y-6">
        {groups.map((group, index) => (
          <AppCardTemplate
            key={group.slug}
            title={pickLocalizedText(group.label, locale) || group.slug}
            content={
              <div className="space-y-4">
                {pickLocalizedText(group.description, locale) ? (
                  <p className="text-sm text-muted-foreground">{pickLocalizedText(group.description, locale)}</p>
                ) : null}
                <FieldGrid columns={group.columns}>
                  {group.fields.map((field: CatalogField) => (
                    <div key={field.name} className={fieldSpanClass(field.span, group.columns)}>
                      <FieldControl
                        field={field}
                        locale={locale}
                        value={values[field.name]}
                        onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))}
                        pairPt={copy.pairPt}
                        pairEn={copy.pairEn}
                      />
                    </div>
                  ))}
                </FieldGrid>
              </div>
            }
            footer={
              index === groups.length - 1 ? (
                <div className="w-full flex justify-end">
                  <Button type="submit">{copy.save}</Button>
                </div>
              ) : undefined
            }
          />
        ))}
      </form>
    </AppPageTemplate>
  );
}
