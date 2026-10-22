import { describe, expect, it } from 'vitest';
import { defaultMemberAudience, resolveMemberAudience } from './audience';

describe('defaultMemberAudience', () => {
  it('defaults to internal for directory-visible fields', () => {
    expect(defaultMemberAudience('internal')).toBe('internal');
    expect(defaultMemberAudience('external')).toBe('internal');
    expect(defaultMemberAudience(null)).toBe('internal');
  });

  it('keeps hidden as private', () => {
    expect(defaultMemberAudience('hidden')).toBe('private');
  });
});

describe('resolveMemberAudience', () => {
  it('uses internal when stored value is missing', () => {
    expect(resolveMemberAudience(undefined, 'internal')).toBe('internal');
  });
});
