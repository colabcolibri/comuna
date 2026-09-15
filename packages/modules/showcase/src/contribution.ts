import type { ModuleContribution } from '@community/module-runtime';

export const SHOWCASE_ROW_ACTION = 'showcase.rowAction';

export const showcaseContribution: ModuleContribution = {
  slug: 'showcase',
  version: '1.0.0',
  requires: ['directory'],
  routes: [{ path: '/showcase' }],
  chrome: [
    { slot: 'sidebar', href: '/showcase', copyKey: 'showcase', icon: 'layoutGrid' },
    { slot: 'home', href: '/showcase', copyKey: 'showcase' },
  ],
  slots: [],
  writesCards: true,
};
