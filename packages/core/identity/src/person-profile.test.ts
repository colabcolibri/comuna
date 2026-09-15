import { describe, expect, it } from 'vitest';
import { parseLanguages, PROFICIENCIES } from './person-profile';

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
