import type { ModuleContribution } from '@community/module-runtime';

export const invitationsContribution: ModuleContribution = {
  slug: 'invitations',
  version: '1.0.0',
  requires: ['directory'],
  routes: [{ path: '/invites' }],
  chrome: [{ slot: 'sidebar', href: '/invites', copyKey: 'invites', memberOnly: true, icon: 'userPlus' }],
  slots: [],
  writesCards: false,
};
