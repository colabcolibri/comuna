import { describe, expect, it } from 'vitest';
import { profileChips } from '../apps/web/src/lib/people/chips';

describe('profile chips', () => {
  it('labels spoken languages from the identity catalog', () => {
    const chips = profileChips(
      {
        availability_status: null,
        languages: [
          { code: 'pt', proficiency: 'native' },
          { code: 'it', proficiency: 'fluent' },
        ],
      },
      {},
      'pt-BR'
    );
    expect(chips).toEqual(['Português', 'Italiano']);
  });
});
