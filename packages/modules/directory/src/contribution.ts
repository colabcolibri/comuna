import type { ModuleContribution } from '@community/module-runtime';

export const directoryContribution: ModuleContribution = {
  slug: 'directory',
  version: '1.0.0',
  requires: [],
  routes: [{ path: '/directory' }],
  chrome: [
    { slot: 'sidebar', href: '/directory', copyKey: 'directory', memberOnly: true, icon: 'users' },
    { slot: 'home', href: '/directory', copyKey: 'directory', memberOnly: true },
  ],
  slots: [],
  writesCards: true,
};
