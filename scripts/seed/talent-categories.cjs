'use strict';

const DEFAULTS = [
  { id: 'mentorship', sort_order: 10, label: { 'pt-BR': 'Mentoria', en: 'Mentorship' }, allows_other_text: false },
  { id: 'project', sort_order: 20, label: { 'pt-BR': 'Projeto', en: 'Project' }, allows_other_text: false },
  { id: 'hiring', sort_order: 30, label: { 'pt-BR': 'Contratação', en: 'Hiring' }, allows_other_text: false },
  { id: 'teaching', sort_order: 40, label: { 'pt-BR': 'Aula', en: 'Teaching' }, allows_other_text: false },
  { id: 'volunteering', sort_order: 50, label: { 'pt-BR': 'Voluntariado', en: 'Volunteering' }, allows_other_text: false },
  { id: 'other', sort_order: 60, label: { 'pt-BR': 'Outros', en: 'Other' }, allows_other_text: true },
];

async function seedTalentCategories(client, communityId) {
  for (const item of DEFAULTS) {
    await client.query(
      `INSERT INTO plugin_talent.categories (community_id, id, sort_order, label, allows_other_text, enabled)
       VALUES ($1, $2, $3, $4::jsonb, $5, true)
       ON CONFLICT (community_id, id) DO NOTHING`,
      [communityId, item.id, item.sort_order, JSON.stringify(item.label), item.allows_other_text]
    );
  }
}

module.exports = { seedTalentCategories };
