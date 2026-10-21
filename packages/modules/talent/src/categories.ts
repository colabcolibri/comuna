export const TALENT_CATEGORIES = [
  { id: 'mentorship', label: { 'pt-BR': 'Mentoria', en: 'Mentorship' } },
  { id: 'project', label: { 'pt-BR': 'Projeto', en: 'Project' } },
  { id: 'hiring', label: { 'pt-BR': 'Contratação', en: 'Hiring' } },
  { id: 'teaching', label: { 'pt-BR': 'Aula', en: 'Teaching' } },
  { id: 'volunteering', label: { 'pt-BR': 'Voluntariado', en: 'Volunteering' } },
  { id: 'other', label: { 'pt-BR': 'Outros', en: 'Other' } },
] as const;

export type TalentCategoryId = (typeof TALENT_CATEGORIES)[number]['id'];

export function categoryLabel(id: string, locale: 'pt-BR' | 'en') {
  const row = TALENT_CATEGORIES.find((item) => item.id === id);
  return row ? row.label[locale] : id;
}

export function parseTalentCategoryFilter(raw: string | null | undefined): TalentCategoryId | '' {
  const id = (raw || '').trim();
  if (!id) {
    return '';
  }
  return TALENT_CATEGORIES.some((item) => item.id === id) ? id : '';
}
