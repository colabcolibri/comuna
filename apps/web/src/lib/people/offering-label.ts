import { categoryLabel } from '@community/talent';
import type { PersonCard } from '@/lib/people/person-card';

export function primaryOfferingLabels(
  offerings: PersonCard['offerings'],
  locale: string
): { category: string | null; title: string | null } {
  const offer = offerings?.[0];
  if (!offer) {
    return { category: null, title: null };
  }
  const lang = locale === 'en' ? 'en' : 'pt-BR';
  const category =
    offer.category_id === 'other' && offer.category_other
      ? offer.category_other
      : offer.category_id
        ? categoryLabel(offer.category_id, lang)
        : null;
  return { category, title: offer.title?.trim() || null };
}
