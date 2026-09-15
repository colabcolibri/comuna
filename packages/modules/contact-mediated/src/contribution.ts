import type { ModuleContribution } from '@community/module-runtime';

export const contactMediatedContribution: ModuleContribution = {
  slug: 'contact-mediated',
  version: '1.0.0',
  requires: ['showcase'],
  routes: [],
  chrome: [],
  slots: [{ id: 'showcase.rowAction' }],
};
