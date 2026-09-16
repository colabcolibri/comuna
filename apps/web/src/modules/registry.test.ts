import { describe, expect, it } from 'vitest';
import { defaultOffSlugs, defaultOnSlugs, firstPartySlugs } from './registry';

describe('first-party registry', () => {
  it('lists map without turning it on', () => {
    expect(firstPartySlugs).toContain('map');
    expect(defaultOnSlugs).not.toContain('map');
    expect(defaultOffSlugs).toEqual(['map']);
  });
});
