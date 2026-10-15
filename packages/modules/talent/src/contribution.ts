import type { ModuleContribution } from '@community/module-runtime';

export const talentContribution: ModuleContribution = {
  slug: 'talent',
  version: '1.0.0',
  requires: ['directory'],
  routes: [{ path: '/talents' }],
  chrome: [{ slot: 'sidebar', href: '/talents', copyKey: 'talent', memberOnly: true, icon: 'users' }],
  slots: [],
  writesCards: false,
};
