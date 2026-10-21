import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { inspectSectionsOf } from '@community/module-runtime';
import type { PersonCard } from '@/lib/people/person-card';
import { offeringCategoryDisplay, type TalentCategoryView } from '@/lib/people/offering-label';
import { firstPartyModules } from '@/modules/registry';

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
    <section className="mt-8 min-w-0">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{copy.talents || 'Talentos'}</h3>
      <ul className="mt-3 grid min-w-0 gap-2">
        {profile.offerings.map((offer) => {
          const category = offeringCategoryDisplay(offer, locale, catalog) || '';
          return (
            <li key={offer.title} className="min-w-0 rounded-xl border border-border bg-card">
              <details className="group min-w-0">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block break-words text-base font-semibold text-foreground">{offer.title}</span>
                    {category ? <span className="mt-0.5 block text-sm text-muted-foreground">{category}</span> : null}
                  </span>
                  <ChevronDown aria-hidden className="mt-1 size-4 shrink-0 text-muted-foreground group-open:rotate-180" />
                </summary>
                <div className="space-y-2 border-t border-border px-4 py-3">
                  {offer.description ? (
                    <p className="break-words text-base leading-relaxed text-muted-foreground">{offer.description}</p>
                  ) : null}
                  {offer.url ? (
                    <a href={offer.url} target="_blank" rel="noopener noreferrer" className="inline-block text-base text-foreground underline">
                      {copy.openLink || 'Abrir'}
                    </a>
                  ) : null}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const SECTION_BODY: Record<
  string,
  (profile: PersonCard, copy: Record<string, string>, locale: string, catalog: TalentCategoryView[]) => ReactNode
> = {
  talent: (profile, copy, locale, catalog) => (
    <TalentSection profile={profile} copy={copy} locale={locale} catalog={catalog} />
  ),
};

export function inspectSections(
  enabled: Iterable<string>,
  profile: PersonCard | null,
  copy: Record<string, string>,
  locale: string,
  catalog: TalentCategoryView[] = []
) {
  if (!profile) {
    return null;
  }
  return inspectSectionsOf(firstPartyModules, enabled).map((module) => {
    const render = SECTION_BODY[module.slug];
    return render ? <div key={module.slug}>{render(profile, copy, locale, catalog)}</div> : null;
  });
}
