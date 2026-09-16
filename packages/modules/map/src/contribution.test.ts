import { describe, expect, it } from 'vitest';
import { DIRECTORY_MAP_VIEW, SHOWCASE_MAP_VIEW, mapContribution } from './contribution';

describe('mapContribution', () => {
  it('extends list surfaces and stays off chrome', () => {
    expect(mapContribution.slug).toBe('map');
    expect(mapContribution.requires).toEqual(['directory']);
    expect(mapContribution.chrome).toEqual([]);
    expect(mapContribution.routes).toEqual([]);
    expect(mapContribution.slots.map((slot) => slot.id)).toEqual([DIRECTORY_MAP_VIEW, SHOWCASE_MAP_VIEW]);
  });
});
