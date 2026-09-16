import { contactMediatedContribution } from '@community/contact-mediated';
import { directoryContribution } from '@community/directory';
import { mapContribution } from '@community/map';
import {
  canWriteCards as cardsFromRegistry,
  chromeOf,
  hasSlot,
  slugsOf,
  type ChromeSlot,
} from '@community/module-runtime';
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

export function visibleChrome(enabled: Iterable<string>, slot: ChromeSlot, signedIn: boolean) {
  return chromeOf(firstPartyModules, enabled, slot).filter((item) => !item.memberOnly || signedIn);
}

export function slotOn(enabled: Iterable<string>, slotId: string) {
  return hasSlot(firstPartyModules, enabled, slotId);
}

export function canWriteCards(enabled: Iterable<string>) {
  return cardsFromRegistry(firstPartyModules, enabled);
}

export function copyFrom(copy: object, key: string) {
  return (copy as Record<string, string>)[key] ?? key;
}
