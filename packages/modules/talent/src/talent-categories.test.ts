import { describe, expect, it } from 'vitest';
import { parseTalentCategoryFilter } from './talent-categories';

describe('parseTalentCategoryFilter', () => {
  it('accepts ids from the community catalog', () => {
    expect(parseTalentCategoryFilter('mentorship', ['mentorship', 'project'])).toBe('mentorship');
  });

  it('rejects unknown ids', () => {
    expect(parseTalentCategoryFilter('nope', ['mentorship'])).toBe('');
  });
});
