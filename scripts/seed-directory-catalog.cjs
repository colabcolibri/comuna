'use strict';

function loc(pt, en) {
  return JSON.stringify([
    { locale: 'pt-BR', value: pt },
    { locale: 'en', value: en },
  ]);
}

function opt(value, pt, en) {
  return { value, label: JSON.parse(loc(pt, en)) };
}

async function seedDirectoryCatalog(client, communityId) {
  const groups = [
    {
      slug: 'identity',
      label: loc('Identidade', 'Identity'),
      description: loc('Nome e foto.', 'Name and photo.'),
      sort: 10,
      columns: 1,
      fields: [
        {
          name: 'full_name',
          type: 'text',
          label: loc('Nome completo', 'Full name'),
          span: 1,
          storage: 'person',
          column_key: 'full_name',
          required: true,
          sort: 10,
        },
        {
          name: 'avatar_url',
          type: 'url',
          label: loc('URL do avatar', 'Avatar URL'),
          span: 1,
          storage: 'person',
          column_key: 'avatar_url',
          sort: 20,
        },
      ],
    },
    {
      slug: 'person',
      label: loc('Pessoa', 'Person'),
      description: loc('Demografia e links.', 'Demographics and links.'),
      sort: 20,
      columns: 3,
      fields: [
        {
          name: 'gender',
          type: 'select',
          label: loc('Gênero', 'Gender'),
          span: 3,
          storage: 'person',
          column_key: 'gender',
          sort: 10,
          options: [
            opt('woman', 'Mulher', 'Woman'),
            opt('man', 'Homem', 'Man'),
            opt('non_binary', 'Não binário', 'Non-binary'),
            opt('prefer_not', 'Prefiro não dizer', 'Prefer not to say'),
          ],
        },
        {
          name: 'birth_city',
          type: 'city',
          label: loc('Cidade de nascimento', 'City of birth'),
          span: 1,
          storage: 'person',
          column_key: 'birth_city',
          sort: 20,
        },
        {
          name: 'current_city',
          type: 'city',
          label: loc('Cidade onde mora', 'City of residence'),
          span: 1,
          storage: 'person',
          column_key: 'current_city',
          sort: 30,
        },
        {
          name: 'languages',
          type: 'checkbox',
          label: loc('Idiomas que fala', 'Languages spoken'),
          span: 3,
          storage: 'person',
          column_key: 'languages',
          sort: 40,
          options: [
            opt('pt', 'pt', 'pt'),
            opt('en', 'en', 'en'),
            opt('es', 'es', 'es'),
            opt('fr', 'fr', 'fr'),
          ],
        },
        {
          name: 'linkedin',
          type: 'url',
          label: loc('LinkedIn', 'LinkedIn'),
          span: 1,
          storage: 'person',
          column_key: 'contacts.linkedin',
          sort: 50,
        },
        {
          name: 'github',
          type: 'url',
          label: loc('GitHub', 'GitHub'),
          span: 1,
          storage: 'person',
          column_key: 'contacts.github',
          sort: 60,
        },
        {
          name: 'portfolio',
          type: 'url',
          label: loc('Portfólio', 'Portfolio'),
          span: 1,
          storage: 'person',
          column_key: 'contacts.portfolio',
          sort: 70,
        },
      ],
    },
    {
      slug: 'community_copy',
      label: loc('Nesta comunidade', 'This community'),
      description: loc('Headline e bio desta rede.', 'Headline and bio for this network.'),
      sort: 30,
      columns: 1,
      fields: [
        {
          name: 'headline',
          type: 'localized_text',
          label: loc('Headline', 'Headline'),
          span: 1,
          storage: 'card_column',
          column_key: 'headline',
          sort: 10,
          module_slug: 'directory',
        },
        {
          name: 'bio',
          type: 'localized_text',
          label: loc('Bio', 'Bio'),
          span: 1,
          storage: 'card_column',
          column_key: 'bio',
          sort: 20,
          module_slug: 'directory',
        },
      ],
    },
    {
      slug: 'availability',
      label: loc('Disponibilidade', 'Availability'),
      description: loc('Como você aparece no diretório.', 'How you appear in the directory.'),
      sort: 40,
      columns: 1,
      fields: [
        {
          name: 'availability_status',
          type: 'select',
          label: loc('Disponibilidade', 'Availability'),
          span: 1,
          storage: 'card_column',
          column_key: 'availability_status',
          sort: 10,
          module_slug: 'directory',
          options: [
            opt('available_for_hire', 'Disponível para contratação', 'Available for hire'),
            opt('project_partner', 'Parceiro de projeto', 'Project partner'),
            opt('mentor', 'Mentoria', 'Mentoring'),
            opt('unavailable', 'Indisponível', 'Unavailable'),
          ],
        },
        {
          name: 'public_showcase',
          type: 'boolean',
          label: loc('Mostrar na vitrine pública', 'Show on the public showcase'),
          span: 1,
          storage: 'card_column',
          column_key: 'public_showcase',
          sort: 20,
          module_slug: 'showcase',
        },
      ],
    },
    {
      slug: 'hospitality',
      label: loc('Hospitalidade', 'Hospitality'),
      description: loc('Perguntas desta comunidade.', 'Questions for this community.'),
      sort: 50,
      columns: 1,
      fields: [
        {
          name: 'host_at_home',
          type: 'boolean',
          label: loc('Topa receber pessoas na sua casa?', 'Would you host people at your home?'),
          description: loc('Para encontros presenciais da rede.', 'For in-person meetups.'),
          span: 1,
          storage: 'attributes',
          filterable: true,
          sort: 10,
          module_slug: 'directory',
        },
      ],
    },
  ];

  for (const group of groups) {
    const inserted = await client.query(
      `INSERT INTO plugin_directory.field_groups (
         community_id, slug, label, description, sort_order, columns
       ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6)
       ON CONFLICT (community_id, slug) DO UPDATE SET
         label = EXCLUDED.label,
         description = EXCLUDED.description,
         sort_order = EXCLUDED.sort_order,
         columns = EXCLUDED.columns
       RETURNING id`,
      [communityId, group.slug, group.label, group.description, group.sort, group.columns]
    );
    const groupId = inserted.rows[0].id;
    for (const field of group.fields) {
      await client.query(
        `INSERT INTO plugin_directory.fields (
           group_id, name, type, label, description, options, span, required, sort_order,
           storage, column_key, filterable, module_id
         ) VALUES (
           $1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12,
           (SELECT id FROM plugin_core.modules WHERE slug = $13)
         )
         ON CONFLICT (group_id, name) DO UPDATE SET
           type = EXCLUDED.type,
           label = EXCLUDED.label,
           description = EXCLUDED.description,
           options = EXCLUDED.options,
           span = EXCLUDED.span,
           required = EXCLUDED.required,
           sort_order = EXCLUDED.sort_order,
           storage = EXCLUDED.storage,
           column_key = EXCLUDED.column_key,
           filterable = EXCLUDED.filterable,
           module_id = EXCLUDED.module_id`,
        [
          groupId,
          field.name,
          field.type,
          field.label,
          field.description || loc('', ''),
          JSON.stringify(field.options || []),
          field.span,
          Boolean(field.required),
          field.sort,
          field.storage,
          field.column_key || null,
          Boolean(field.filterable),
          field.module_slug || null,
        ]
      );
    }
  }
}

module.exports = { seedDirectoryCatalog };
