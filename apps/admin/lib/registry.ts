import { contactMediatedContribution } from '@community/contact-mediated';
import { directoryContribution } from '@community/directory';
import { slugsOf } from '@community/module-runtime';
import { showcaseContribution } from '@community/showcase';

export const firstPartyModules = [
  directoryContribution,
  showcaseContribution,
  contactMediatedContribution,
];

export const firstPartySlugs = slugsOf(firstPartyModules);
