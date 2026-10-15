import { describe, expect, it } from 'vitest';
import { effectiveAudience, exposureFromPlacement } from './audience';

describe('field exposure', () => {
  it('maps placement to a ceiling', () => {
    expect(exposureFromPlacement({ directory: 'card', showcase: 'detail' })).toBe('external');
    expect(exposureFromPlacement({ directory: 'detail', showcase: 'off' })).toBe('internal');
    expect(exposureFromPlacement({ directory: 'off', showcase: 'off' })).toBe('hidden');
  });

  it('keeps the lower of person audience and ceiling', () => {
    expect(effectiveAudience('external', 'internal')).toBe('internal');
    expect(effectiveAudience('external', 'hidden')).toBeNull();
    expect(effectiveAudience('private', 'external')).toBe('private');
    expect(effectiveAudience('external', 'external')).toBe('external');
  });
});
