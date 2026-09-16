import { describe, expect, it } from 'vitest';
import { firstPartySlugs } from './registry';

describe('first-party registry', () => {
  it('enables all first-party plugins for new communities', () => {
    expect(firstPartySlugs).toEqual(['directory', 'showcase', 'contact-mediated', 'map']);
  });
});
