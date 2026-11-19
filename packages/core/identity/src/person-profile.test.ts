import { describe, expect, it } from 'vitest';
import { isSafeAvatarUrl, isSafeHttpUrl, parseContacts, parseLanguages, PROFICIENCIES } from './person-profile';

describe('spoken language proficiency', () => {
  it('includes advanced between intermediate and fluent', () => {
    expect([...PROFICIENCIES]).toEqual(['basic', 'intermediate', 'advanced', 'fluent', 'native']);
  });

  it('keeps an advanced row', () => {
    expect(parseLanguages([{ code: 'fr', proficiency: 'advanced' }])).toEqual([
      { code: 'fr', proficiency: 'advanced' },
    ]);
  });
});

describe('URL sanitization (US-0135)', () => {
  it('strips javascript: and data: URLs from contacts while preserving https://', () => {
    expect(
      parseContacts({
        linkedin: 'https://linkedin.com/in/ana',
        github: 'javascript:alert(document.cookie)',
        portfolio: 'data:text/html,<script>alert(1)</script>',
      })
    ).toEqual({
      linkedin: 'https://linkedin.com/in/ana',
      github: '',
      portfolio: '',
    });
  });

  it('validates safe HTTP(S) and avatar URLs', () => {
    expect(isSafeHttpUrl('https://example.com/path')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeAvatarUrl('/api/media/person/123e4567-e89b-12d3-a456-426614174000/avatar')).toBe(true);
    expect(isSafeAvatarUrl('javascript:alert(1)')).toBe(false);
  });
});
