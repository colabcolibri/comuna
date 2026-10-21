/** Default taxonomy copied into each community on create/seed. */
export const DEFAULT_TALENT_CATEGORY_SEED = [
  { id: 'mentorship', sortOrder: 10, label: { 'pt-BR': 'Mentoria', en: 'Mentorship' }, allowsOtherText: false },
  { id: 'project', sortOrder: 20, label: { 'pt-BR': 'Projeto', en: 'Project' }, allowsOtherText: false },
  { id: 'hiring', sortOrder: 30, label: { 'pt-BR': 'Contratação', en: 'Hiring' }, allowsOtherText: false },
  { id: 'teaching', sortOrder: 40, label: { 'pt-BR': 'Aula', en: 'Teaching' }, allowsOtherText: false },
  { id: 'volunteering', sortOrder: 50, label: { 'pt-BR': 'Voluntariado', en: 'Volunteering' }, allowsOtherText: false },
  { id: 'other', sortOrder: 60, label: { 'pt-BR': 'Outros', en: 'Other' }, allowsOtherText: true },
] as const;
