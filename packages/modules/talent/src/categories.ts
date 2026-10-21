import { DEFAULT_TALENT_CATEGORY_SEED } from './category-seed';

/** @deprecated Use listTalentCategories from the database. Kept for tests and seed references. */
export const TALENT_CATEGORIES = DEFAULT_TALENT_CATEGORY_SEED.map((item) => ({
  id: item.id,
  label: item.label,
}));

export type TalentCategoryId = string;
