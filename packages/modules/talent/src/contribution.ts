import type { ModuleContribution } from '@community/module-runtime';

export const talentContribution: ModuleContribution = {
  slug: 'talent',
  version: '1.0.0',
  requires: ['directory'],
  routes: [{ path: '/talents' }],
  chrome: [],
  slots: [{ id: 'inspect.section' }],
  writesCards: false,
};
