import { contactMediatedContribution } from '@community/contact-mediated';
import { directoryContribution } from '@community/directory';
import { mapContribution } from '@community/map';
import { slugsOf } from '@community/module-runtime';
import { showcaseContribution } from '@community/showcase';

export const firstPartyModules = [
  directoryContribution,
  showcaseContribution,
  contactMediatedContribution,
  mapContribution,
];

export const firstPartySlugs = slugsOf(firstPartyModules);
export const defaultOnSlugs = firstPartySlugs.filter((slug) => slug !== mapContribution.slug);
export const defaultOffSlugs = [mapContribution.slug];
