import type { ModuleContribution } from '@community/module-runtime';

export const DIRECTORY_MAP_VIEW = 'directory.mapView';
export const SHOWCASE_MAP_VIEW = 'showcase.mapView';

export const mapContribution: ModuleContribution = {
  slug: 'map',
  version: '1.0.0',
  requires: ['directory'],
  routes: [],
  chrome: [],
  slots: [{ id: DIRECTORY_MAP_VIEW }, { id: SHOWCASE_MAP_VIEW }],
};
