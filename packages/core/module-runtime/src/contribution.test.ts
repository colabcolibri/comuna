import { chromeOf, hasSlot, slugsOf, type ModuleContribution } from './contribution';

const directory: ModuleContribution = {
  slug: 'directory',
  version: '1.0.0',
  requires: [],
  routes: [{ path: '/directory' }],
  chrome: [
    { slot: 'sidebar', href: '/directory', copyKey: 'directory', memberOnly: true, icon: 'users' },
    { slot: 'home', href: '/directory', copyKey: 'directory', memberOnly: true },
  ],
  slots: [],
};

const showcase: ModuleContribution = {
  slug: 'showcase',
  version: '1.0.0',
  requires: ['directory'],
  routes: [{ path: '/showcase' }],
  chrome: [
    { slot: 'sidebar', href: '/showcase', copyKey: 'showcase', icon: 'layoutGrid' },
    { slot: 'header', href: '/showcase', copyKey: 'showcase' },
    { slot: 'home', href: '/showcase', copyKey: 'showcase' },
  ],
  slots: [],
};

const contact: ModuleContribution = {
  slug: 'contact-mediated',
  version: '1.0.0',
  requires: ['showcase'],
  routes: [],
  chrome: [],
  slots: [{ id: 'showcase.rowAction' }],
};

describe('module contributions', () => {
  const registry = [directory, showcase, contact];

  it('derives slugs from the registry', () => {
    expect(slugsOf(registry)).toEqual(['directory', 'showcase', 'contact-mediated']);
  });

  it('filters chrome by enabled slug, not by field heuristics', () => {
    expect(chromeOf(registry, ['showcase'], 'header').map((item) => item.href)).toEqual(['/showcase']);
    expect(chromeOf(registry, [], 'sidebar')).toEqual([]);
  });

  it('exposes slots only when the contributing plugin is on', () => {
    expect(hasSlot(registry, ['contact-mediated'], 'showcase.rowAction')).toBe(true);
    expect(hasSlot(registry, ['showcase'], 'showcase.rowAction')).toBe(false);
  });
});
