import { contactMediatedContribution } from '@community/contact-mediated';
import { directoryContribution } from '@community/directory';
import { mapContribution } from '@community/map';
import { slugsOf } from '@community/module-runtime';
import { showcaseContribution } from '@community/showcase';
import { talentContribution } from '@community/talent';

export const firstPartyModules = [
  directoryContribution,
  showcaseContribution,
  contactMediatedContribution,
  mapContribution,
  talentContribution,
];

export const firstPartySlugs = slugsOf(firstPartyModules);
export const defaultEnabledSlugs = firstPartySlugs.filter((slug) => slug !== talentContribution.slug);
