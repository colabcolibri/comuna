import type { ModuleContribution } from '@community/module-runtime';

export const calendarContribution: ModuleContribution = {
  slug: 'calendar',
  version: '1.0.0',
  requires: ['directory'],
  routes: [{ path: '/calendar' }],
  chrome: [{ slot: 'sidebar', href: '/calendar', copyKey: 'calendar', memberOnly: true, icon: 'calendar' }],
  slots: [],
  writesCards: false,
};
