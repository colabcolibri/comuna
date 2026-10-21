import { pickLocalizedText, type LocalizedText } from '@community/identity';
import { categoryLabel } from '@community/talent';
import type { PersonCard } from '@/lib/people/person-card';

export type TalentCategoryView = {
  id: string;
  label: LocalizedText;
  allowsOtherText: boolean;
};

export function offeringCategoryDisplay(
  offer: NonNullable<PersonCard['offerings']>[number],
  locale: string,
  catalog?: TalentCategoryView[]
): string | null {
  if (!offer.category_id) {
    return null;
  }
  const lang = locale === 'en' ? 'en' : 'pt-BR';
  const row = catalog?.find((item) => item.id === offer.category_id);
  if (row?.allowsOtherText && offer.category_other) {
    return offer.category_other;
  }
  if (catalog?.length) {
    return categoryLabel(offer.category_id, lang, catalog) || null;
  }
  if (offer.category_id === 'other' && offer.category_other) {
    return offer.category_other;
  }
  return offer.category_id ? categoryLabel(offer.category_id, lang, catalog || []) : null;
}

export function primaryOfferingLabels(
  offerings: PersonCard['offerings'],
  locale: string,
  catalog?: TalentCategoryView[]
): { category: string | null; title: string | null } {
  const offer = offerings?.[0];
  if (!offer) {
    return { category: null, title: null };
  }
  return {
    category: offeringCategoryDisplay(offer, locale, catalog),
    title: offer.title?.trim() || null,
  };
}
