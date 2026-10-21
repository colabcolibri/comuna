import { describe, expect, it } from 'vitest';
import {
  communityAllowsDirectoryListing,
  communityAllowsShowcaseListing,
  communityListingExposureCap,
} from './member-exposure';
import type { CatalogField } from './catalog';

function field(exposure: 'hidden' | 'internal' | 'external' | null, overrides: Partial<CatalogField> = {}): CatalogField {
  return {
    name: overrides.name || 'custom',
    type: 'text',
    label: [],
    description: [],
    options: [],
    span: 1,
    required: false,
    localized: false,
    sort_order: 1,
    storage: overrides.storage || 'attributes',
    column_key: overrides.column_key || null,
    enabled: true,
    module_slug: 'directory',
    exposure,
    ...overrides,
  };
}

describe('community listing exposure', () => {
  it('caps at internal when no field allows external', () => {
    const fields = [
      field('internal', { name: 'headline', storage: 'card_column', column_key: 'headline' }),
      field('hidden', { name: 'secret' }),
    ];
    expect(communityListingExposureCap(fields)).toBe('internal');
    expect(communityAllowsDirectoryListing(fields)).toBe(true);
    expect(communityAllowsShowcaseListing(fields)).toBe(false);
  });

  it('allows showcase when any listing field is external-capable', () => {
    const fields = [
      field('internal', { name: 'headline', storage: 'card_column', column_key: 'headline' }),
      field('external', { name: 'pitch' }),
    ];
    expect(communityListingExposureCap(fields)).toBe('external');
    expect(communityAllowsShowcaseListing(fields)).toBe(true);
  });

  it('blocks directory when every listing field is hidden', () => {
    const fields = [field('hidden', { name: 'headline', storage: 'card_column', column_key: 'headline' })];
    expect(communityListingExposureCap(fields)).toBe('hidden');
    expect(communityAllowsDirectoryListing(fields)).toBe(false);
  });
});
