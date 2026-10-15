import type { ReactNode } from 'react';
import { inspectSectionsOf } from '@community/module-runtime';
import type { PersonCard } from '@/lib/people/person-card';
import { firstPartyModules } from '@/modules/registry';

function TalentSection({ profile, copy }: { profile: PersonCard; copy: Record<string, string> }) {
  if (!profile.offerings?.length) {
    return null;
  }
  return (
    <section className="mt-6 min-w-0">
      <h3 className="text-sm font-medium text-foreground">{copy.talents || 'Talentos'}</h3>
      <ul className="mt-3 grid min-w-0 gap-4">
        {profile.offerings.map((offer) => (
          <li key={offer.title} className="min-w-0">
            <p className="break-words text-sm font-medium">{offer.title}</p>
            {offer.category_other ? <p className="text-xs text-muted-foreground">{offer.category_other}</p> : null}
            {offer.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
            ) : null}
            {offer.url ? (
              <a href={offer.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm underline">
                {copy.openLink || 'Abrir'}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

const SECTION_BODY: Record<string, (profile: PersonCard, copy: Record<string, string>) => ReactNode> = {
  talent: (profile, copy) => <TalentSection profile={profile} copy={copy} />,
};

export function inspectSections(enabled: Iterable<string>, profile: PersonCard | null, copy: Record<string, string>) {
  if (!profile) {
    return null;
  }
  return inspectSectionsOf(firstPartyModules, enabled).map((module) => {
    const render = SECTION_BODY[module.slug];
    return render ? <div key={module.slug}>{render(profile, copy)}</div> : null;
  });
}
