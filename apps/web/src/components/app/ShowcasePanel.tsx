'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { AppPageTemplate, AppShowcaseCard, AppShowcaseGrid } from '@community/ui-member';
import { Button } from '@community/ui';
import { contentFromCatalog, mergeContent, pickContent, pickLocalizedText } from '@community/identity';
import { displayPlaceLocality } from '@community/places';
import { useLocale } from '@/components/app/LocaleProvider';
import { useEnabledModules } from '@/components/app/EnabledModulesProvider';
import { PersonInspect } from '@/components/app/PersonInspect';
import { SHOWCASE_ROW_ACTION } from '@community/showcase';
import { uiCatalog } from '@/lang/catalog';
import { slotOn } from '@/modules/registry';
import { profileChips } from '@/lib/people/chips';
import type { PersonCard } from '@/lib/people/person-card';

const CONTENT = mergeContent(
  contentFromCatalog(uiCatalog, 'plugin_showcase', {
    kicker: 'page.kicker',
    title: 'page.title',
    subtitle: 'page.subtitle',
    empty: 'page.empty',
    view: 'page.view',
    close: 'page.close',
    privacy: 'page.privacy',
    langPt: 'lang.pt',
    langEn: 'lang.en',
    langEs: 'lang.es',
    langFr: 'lang.fr',
    hire: 'avail.available_for_hire',
    partner: 'avail.project_partner',
    mentor: 'avail.mentor',
    unavailable: 'avail.unavailable',
    host: 'host.yes',
    linkedin: 'link.linkedin',
    github: 'link.github',
    portfolio: 'link.portfolio',
  }),
  contentFromCatalog(uiCatalog, 'plugin_contact_mediated', {
    contact: 'form.contact',
    cancel: 'form.cancel',
    send: 'form.send',
    success: 'form.success',
    email: 'form.email',
    message: 'form.message',
  })
);

export function ShowcasePanel({ rows, lead }: { rows: PersonCard[]; lead?: ReactNode }) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const enabled = useEnabledModules();
  const canContact = slotOn(enabled, SHOWCASE_ROW_ACTION);
  const [selected, setSelected] = useState<PersonCard | null>(null);

  return (
    <AppPageTemplate kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle}>
      {lead}
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        <AppShowcaseGrid>
          {rows.map((profile) => {
            const headline = pickLocalizedText(profile.headline, locale);
            const summary = pickLocalizedText(profile.bio, locale);
            return (
              <AppShowcaseCard
                key={profile.id}
                name={profile.full_name}
                photoUrl={profile.avatar_url}
                headline={headline}
                summary={summary}
                city={displayPlaceLocality(profile.current_city, locale)}
                chips={profileChips(profile, copy)}
                action={
                  <Button variant="outline" className="min-h-11 w-full" onClick={() => setSelected(profile)}>
                    {copy.view}
                  </Button>
                }
              />
            );
          })}
        </AppShowcaseGrid>
      )}
      <PersonInspect
        profile={selected}
        copy={copy}
        locale={locale}
        canContact={canContact}
        onClose={() => setSelected(null)}
      />
    </AppPageTemplate>
  );
}
