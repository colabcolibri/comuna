import { describe, expect, it } from 'vitest';
import { toPersonCard } from './person-card';

describe('person card projection', () => {
  it('turns null headline and bio into empty arrays', () => {
    const card = toPersonCard({
      id: 'm1',
      full_name: 'Ops',
      headline: null,
      bio: null,
      contacts: { email: 'hidden@example.com', linkedin: 'https://linkedin.com/in/x' },
    });
    expect(card.headline).toEqual([]);
    expect(card.bio).toEqual([]);
    expect(card.contacts).toEqual({ linkedin: 'https://linkedin.com/in/x' });
  });
});
