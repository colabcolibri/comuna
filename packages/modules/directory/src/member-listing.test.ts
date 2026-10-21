import { describe, expect, it } from 'vitest';
import { memberListingHints, memberListsOnSurface } from './member-listing';
import type { CatalogField } from './catalog';

const headlineField: CatalogField = {
  name: 'headline',
  type: 'text',
  label: [],
  description: [],
  options: [],
  span: 1,
  required: false,
  localized: true,
  sort_order: 1,
  storage: 'card_column',
  column_key: 'headline',
  enabled: true,
  module_slug: 'directory',
  exposure: 'external',
};

describe('memberListsOnSurface', () => {
  it('lists when headline is internal with content', () => {
    const ok = memberListsOnSurface('directory', {
      headline: [{ locale: 'pt-BR', value: 'Designer' }],
      headline_audience: 'internal',
    }, [headlineField]);
    expect(ok).toBe(true);
  });

  it('does not list when everything is private', () => {
    const ok = memberListsOnSurface('directory', {
      headline: [{ locale: 'pt-BR', value: 'Designer' }],
      headline_audience: 'private',
    }, [headlineField]);
    expect(ok).toBe(false);
  });

  it('does not list showcase when public_showcase is false', () => {
    const ok = memberListsOnSurface('showcase', {
      headline: [{ locale: 'pt-BR', value: 'Designer' }],
      headline_audience: 'external',
      public_showcase: false,
    }, [headlineField]);
    expect(ok).toBe(false);
  });

  it('lists showcase when opted in with external headline', () => {
    const ok = memberListsOnSurface('showcase', {
      headline: [{ locale: 'pt-BR', value: 'Designer' }],
      headline_audience: 'external',
      public_showcase: true,
    }, [headlineField]);
    expect(ok).toBe(true);
  });

  it('hints when community blocks showcase', () => {
    const internalOnly: CatalogField = { ...headlineField, exposure: 'internal' };
    const hints = memberListingHints({
      directoryOn: true,
      showcaseOn: true,
      card: {
        headline: [{ locale: 'pt-BR', value: 'X' }],
        headline_audience: 'internal',
        public_showcase: true,
      },
      fields: [internalOnly],
    });
    expect(hints).toContain('community_showcase_blocked');
    expect(hints).not.toContain('visible_showcase');
  });

  it('hints when all private', () => {
    const hints = memberListingHints({
      directoryOn: true,
      showcaseOn: true,
      card: {
        headline: [{ locale: 'pt-BR', value: 'X' }],
        headline_audience: 'private',
      },
      fields: [headlineField],
    });
    expect(hints).toContain('all_private');
  });
});
