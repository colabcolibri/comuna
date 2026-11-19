import type { ReactNode } from 'react';
import { isSafeHttpUrl } from '@community/identity';
import { inspectSectionsOf } from '@community/module-runtime';
import type { PersonCard } from '@/lib/people/person-card';
import { offeringCategoryDisplay, type TalentCategoryView } from '@/lib/people/offering-label';
import { firstPartyModules } from '@/modules/registry';

export type InspectTabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

function TalentSection({
  profile,
  copy,
  locale,
  catalog,
}: {
  profile: PersonCard;
  copy: Record<string, string>;
  locale: string;
  catalog: TalentCategoryView[];
}) {
  if (!profile.offerings?.length) {
    return null;
  }
  return (
    <section className="min-w-0">
      <ul className="grid min-w-0 gap-3 sm:grid-cols-2">
        {profile.offerings.map((offer) => {
          const category = offeringCategoryDisplay(offer, locale, catalog) || '';
          const safeUrl = offer.url && isSafeHttpUrl(offer.url) ? offer.url : null;
          return (
            <li key={`${offer.category_id}:${offer.title}`} className="min-w-0 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0">
                <p className="break-words text-base font-semibold text-foreground">{offer.title}</p>
                {category ? <p className="mt-1 text-sm text-muted-foreground">{category}</p> : null}
              </div>
              {offer.description ? (
                <p className="mt-3 break-words text-base leading-relaxed text-muted-foreground">{offer.description}</p>
              ) : null}
              {safeUrl ? (
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-foreground underline"
                >
                  {copy.openLink || 'Abrir'}
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const TAB_BUILDERS: Record<
  string,
  (profile: PersonCard, copy: Record<string, string>, locale: string, catalog: TalentCategoryView[]) => InspectTabItem | null
> = {
  talent: (profile, copy, locale, catalog) => {
    if (!profile.offerings?.length) {
      return null;
    }
    return {
      id: 'talent',
      label: copy.talents || 'Talentos',
      content: <TalentSection profile={profile} copy={copy} locale={locale} catalog={catalog} />,
    };
  },
};

export function inspectTabs(
  enabled: Iterable<string>,
  profile: PersonCard | null,
  copy: Record<string, string>,
  locale: string,
  catalog: TalentCategoryView[] = []
): InspectTabItem[] {
  if (!profile) {
    return [];
  }
  return inspectSectionsOf(firstPartyModules, enabled)
    .map((module) => TAB_BUILDERS[module.slug]?.(profile, copy, locale, catalog) ?? null)
    .filter((tab): tab is InspectTabItem => tab !== null);
}

export function inspectSections(
  enabled: Iterable<string>,
  profile: PersonCard | null,
  copy: Record<string, string>,
  locale: string,
  catalog: TalentCategoryView[] = []
) {
  const tabs = inspectTabs(enabled, profile, copy, locale, catalog);
  if (!tabs.length) {
    return null;
  }
  return tabs.map((tab) => <div key={tab.id}>{tab.content}</div>);
}
