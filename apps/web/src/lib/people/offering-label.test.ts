import { describe, expect, it } from 'vitest';
import { offeringCategoryDisplay, primaryOfferingLabels } from './offering-label';

describe('offeringCategoryDisplay', () => {
  it('shows localized label, not raw id', () => {
    expect(
      offeringCategoryDisplay(
        { title: 'X', category_id: 'mentorship' },
        'pt-BR',
        [{ id: 'mentorship', label: [{ locale: 'pt-BR', value: 'Mentoria GSA' }], allowsOtherText: false }]
      )
    ).toBe('Mentoria GSA');
  });
});

describe('primaryOfferingLabels', () => {
  it('prefers featured offering over first in list', () => {
    const result = primaryOfferingLabels(
      [
        { title: 'Primeira', featured_on_card: false },
        { title: 'Destaque', featured_on_card: true },
      ],
      'pt-BR'
    );
    expect(result.title).toBe('Destaque');
  });
});
