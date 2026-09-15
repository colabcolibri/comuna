export type ChromeSlot = 'sidebar' | 'header' | 'home';

export type ChromeIcon = 'users' | 'layoutGrid';

export type ChromeItem = {
  slot: ChromeSlot;
  href: string;
  copyKey: string;
  memberOnly?: boolean;
  icon?: ChromeIcon;
};

export type ModuleContribution = {
  slug: string;
  version: string;
  requires: string[];
  routes: { path: string }[];
  chrome: ChromeItem[];
  slots: { id: string }[];
  writesCards?: boolean;
};

export function slugsOf(registry: ModuleContribution[]): string[] {
  return registry.map((module) => module.slug);
}

export function contributionsOn(
  registry: ModuleContribution[],
  enabled: Iterable<string>
): ModuleContribution[] {
  const on = new Set(enabled);
  return registry.filter((module) => on.has(module.slug));
}

export function chromeOf(
  registry: ModuleContribution[],
  enabled: Iterable<string>,
  slot: ChromeSlot
): ChromeItem[] {
  return contributionsOn(registry, enabled).flatMap((module) =>
    module.chrome.filter((item) => item.slot === slot)
  );
}

export function hasSlot(
  registry: ModuleContribution[],
  enabled: Iterable<string>,
  slotId: string
): boolean {
  return contributionsOn(registry, enabled).some((module) =>
    module.slots.some((slot) => slot.id === slotId)
  );
}

export function canWriteCards(registry: ModuleContribution[], enabled: Iterable<string>): boolean {
  return contributionsOn(registry, enabled).some((module) => module.writesCards);
}
