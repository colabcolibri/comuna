import { describe, expect, it } from 'vitest';
import { migratedBlockAudience } from './audience';

describe('migratedBlockAudience', () => {
  it('maps showcase content to external', () => {
    expect(
      migratedBlockAudience({ publicDirectory: false, publicShowcase: true, hasContent: true })
    ).toBe('external');
  });

  it('maps directory-only content to internal', () => {
    expect(
      migratedBlockAudience({ publicDirectory: true, publicShowcase: false, hasContent: true })
    ).toBe('internal');
  });

  it('keeps hidden and empty blocks private', () => {
    expect(
      migratedBlockAudience({ publicDirectory: false, publicShowcase: false, hasContent: true })
    ).toBe('private');
    expect(
      migratedBlockAudience({ publicDirectory: true, publicShowcase: true, hasContent: false })
    ).toBe('private');
  });
});
