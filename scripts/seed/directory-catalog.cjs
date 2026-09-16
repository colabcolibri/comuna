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

const LIST = {
  hidden: { filterable: false, placement: 'off' },
  card: { filterable: false, placement: 'card' },
  detail: { filterable: false, placement: 'detail' },
};

const LISTS = {
  identity: { directory: LIST.card, showcase: LIST.card },
  pii: { directory: LIST.hidden, showcase: LIST.hidden },
  bio: { directory: LIST.detail, showcase: { filterable: false, placement: 'card' } },
  availability: {
    directory: { filterable: false, placement: 'detail' },
    showcase: { filterable: true, placement: 'card' },
  },
  links: { directory: LIST.detail, showcase: LIST.detail },
  extraFilter: {
    directory: { filterable: true, placement: 'detail' },
    showcase: { filterable: true, placement: 'detail' },
  },
  extraDirectoryOnly: { directory: LIST.detail, showcase: LIST.hidden },
};

const PLATFORM_CATALOG_GROUPS = [
    {
      slug: 'identity',
      label: loc('Nome e foto', 'Name and photo'),
      description: loc(
        'Como a pessoa aparece no diretório desta casa. Vale para todas as comunidades em que ela entra.',
        'How the person appears in this house directory. It follows them into every community they join.'
      ),
      sort: 10,
      columns: 1,
      fields: [
        {
          name: 'full_name',
          type: 'text',
          label: loc('Nome completo', 'Full name'),
          description: loc(
            'O nome que a rede usa para te achar. Pode ser o nome social; não precisa ser o do documento.',
            'The name the network uses to find you. It can be the name you use; it does not have to match a document.'
          ),
          span: 1,
          storage: 'person',
          column_key: 'full_name',
          required: true,
          sort: 10,
          lists: LISTS.identity,
        },
        {
          name: 'avatar_url',
          type: 'image',
          label: loc('Foto', 'Photo'),
          description: loc(
            'Rosto nítido, de preferência só você, em luz comum. Evite logo, recorte de evento e foto de grupo.',
            'A clear face, preferably just you, in ordinary light. Avoid logos, event crops, and group photos.'
          ),
          span: 1,
          storage: 'person',
          column_key: 'avatar_url',
          sort: 20,
          lists: LISTS.identity,
        },
      ],
    },
    {
      slug: 'person',
      label: loc('Sobre você', 'About you'),
      description: loc(
        'Identidade e lugar. Cidade vem do mapa, não de texto livre, para o filtro do diretório não quebrar.',
        'Identity and place. City comes from the map, not free text, so directory filters stay coherent.'
      ),
      sort: 30,
      columns: 2,
      fields: [
        {
          name: 'gender',
          type: 'select',
          label: loc('Gênero', 'Gender'),
          description: loc(
            'Como você quer aparecer nesta rede. Prefiro não dizer também é resposta.',
            'How you want to appear in this network. Prefer not to say is a valid answer.'
          ),
          span: 2,
          storage: 'person',
          column_key: 'gender',
          sort: 10,
          options: [
            opt('woman', 'Mulher', 'Woman'),
            opt('man', 'Homem', 'Man'),
            opt('non_binary', 'Não binário', 'Non-binary'),
            opt('prefer_not', 'Prefiro não dizer', 'Prefer not to say'),
          ],
          lists: LISTS.pii,
        },
        {
          name: 'birth_city',
          type: 'city',
          label: loc('Cidade de nascimento', 'City of birth'),
          description: loc(
            'Cidade em que você nasceu, se quiser contar. Fica no perfil; não entra na vitrine nem no filtro das listas.',
            'The city you were born in, if you want to share it. It stays on the profile; it does not enter the showcase or list filters.'
          ),
          span: 1,
          storage: 'person',
          column_key: 'birth_city',
          sort: 20,
          lists: LISTS.pii,
        },
        {
          name: 'current_city',
          type: 'city',
          label: loc('Cidade onde mora', 'City of residence'),
          description: loc(
            'Onde você mora agora. Se está em trânsito, use a cidade em que passa a maior parte do mês.',
            'Where you live now. If you are in transit, use the city where you spend most of the month.'
          ),
          span: 1,
          storage: 'person',
          column_key: 'current_city',
          sort: 30,
          lists: LISTS.identity,
        },
        {
          name: 'languages',
          type: 'checkbox',
          label: loc('Idiomas que fala', 'Languages spoken'),
          description: loc(
            'Idiomas que você usa de verdade, com o nível. Não precisa listar o que já esqueceu.',
            'Languages you actually use, with a level. Skip the ones you already forgot.'
          ),
          span: 2,
          storage: 'person',
          column_key: 'languages',
          sort: 40,
          options: [
            opt('pt', 'Português', 'Portuguese'),
            opt('en', 'Inglês', 'English'),
            opt('es', 'Espanhol', 'Spanish'),
            opt('fr', 'Francês', 'French'),
            opt('de', 'Alemão', 'German'),
            opt('it', 'Italiano', 'Italian'),
            opt('nl', 'Holandês', 'Dutch'),
            opt('zh', 'Chinês', 'Chinese'),
            opt('ja', 'Japonês', 'Japanese'),
            opt('ko', 'Coreano', 'Korean'),
            opt('ru', 'Russo', 'Russian'),
            opt('ar', 'Árabe', 'Arabic'),
          ],
          lists: LISTS.identity,
        },
      ],
    },
    {
      slug: 'links',
      label: loc('Links', 'Links'),
      description: loc(
        'Endereços públicos. Nenhum é obrigatório. E-mail da conta não entra aqui de propósito.',
        'Public URLs. None are required. The account email stays out of this group on purpose.'
      ),
      sort: 35,
      columns: 1,
      fields: [
        {
          name: 'linkedin',
          type: 'url',
          label: loc('LinkedIn', 'LinkedIn'),
          description: loc(
            'Cole o endereço completo do perfil, não o nome de usuário sozinho.',
            'Paste the full profile URL, not the username alone.'
          ),
          span: 1,
          storage: 'person',
          column_key: 'contacts.linkedin',
          sort: 10,
          lists: LISTS.links,
        },
        {
          name: 'github',
          type: 'url',
          label: loc('GitHub', 'GitHub'),
          description: loc(
            'Perfil público. Se o repositório que importa é da organização, ainda assim use o seu usuário.',
            'A public profile. If the repo that matters belongs to an org, still use your own user.'
          ),
          span: 1,
          storage: 'person',
          column_key: 'contacts.github',
          sort: 20,
          lists: LISTS.links,
        },
        {
          name: 'portfolio',
          type: 'url',
          label: loc('Portfólio', 'Portfolio'),
          description: loc(
            'Site, Notion público, Behance ou página da pesquisa. Evite login obrigatório.',
            'A site, public Notion, Behance, or a research page. Avoid anything behind a login.'
          ),
          span: 1,
          storage: 'person',
          column_key: 'contacts.portfolio',
          sort: 30,
          lists: LISTS.links,
        },
      ],
    },
    {
      slug: 'community_copy',
      label: loc('Nesta comunidade', 'This community'),
      description: loc(
        'Texto desta casa. A mesma pessoa pode se apresentar de outro jeito na incubadora e no alumni.',
        'Copy for this house. The same person can introduce themselves differently in the incubator and the alumni network.'
      ),
      sort: 20,
      columns: 1,
      fields: [
        {
          name: 'headline',
          type: 'localized_text',
          label: loc('Título', 'Title'),
          description: loc(
            'Uma linha, no tom desta comunidade. Diga o ofício, não o slogan da empresa.',
            'One line, in the tone of this community. Name the craft, not the company slogan.'
          ),
          span: 1,
          storage: 'card_column',
          column_key: 'headline',
          sort: 10,
          module_slug: 'directory',
          lists: LISTS.identity,
        },
        {
          name: 'bio',
          type: 'localized_text',
          label: loc('Apresentação', 'About'),
          description: loc(
            'Duas ou três frases: o que você faz, para quem, e como a rede pode te procurar. Sem currículo colado.',
            'Two or three sentences: what you do, for whom, and how the network can reach you. Not a pasted CV.'
          ),
          span: 1,
          storage: 'card_column',
          column_key: 'bio',
          sort: 20,
          module_slug: 'directory',
          lists: LISTS.bio,
        },
      ],
    },
    {
      slug: 'availability',
      label: loc('Disponibilidade', 'Availability'),
      description: loc(
        'Como a pessoa quer ser procurada nesta comunidade, e se o cartão entra na vitrine pública.',
        'How this person wants to be approached in this community, and whether the card appears on the public showcase.'
      ),
      sort: 40,
      columns: 1,
      fields: [
        {
          name: 'availability_status',
          type: 'select',
          label: loc('Disponibilidade', 'Availability'),
          description: loc(
            'O convite desta casa. Indisponível não esconde o cartão; só diz que agora não é hora de pauta nova.',
            'The ask in this house. Unavailable does not hide the card; it only says now is not the time for a new brief.'
          ),
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
          lists: LISTS.availability,
        },
        {
          name: 'public_showcase',
          type: 'boolean',
          label: loc('Mostrar na vitrine pública', 'Show on the public showcase'),
          description: loc(
            'Se esta comunidade tem vitrine, o cartão só entra com o seu sim. Desligado, você continua no diretório interno.',
            'If this community has a showcase, the card only appears with your yes. When off, you still stay in the internal directory.'
          ),
          span: 1,
          storage: 'card_column',
          column_key: 'public_showcase',
          sort: 20,
          module_slug: 'showcase',
          lists: LISTS.pii,
        },
      ],
    },
  ];

async function seedDirectoryCatalog(client, communityId) {
  await upsertCatalogGroups(client, communityId, PLATFORM_CATALOG_GROUPS);

  await client.query(
    `UPDATE plugin_directory.fields f
     SET group_id = links.id,
         sort_order = CASE f.name WHEN 'linkedin' THEN 10 WHEN 'github' THEN 20 WHEN 'portfolio' THEN 30 ELSE f.sort_order END,
         span = 1
     FROM plugin_directory.field_groups person
     JOIN plugin_directory.field_groups links
       ON links.community_id = person.community_id AND links.slug = 'links'
     WHERE person.community_id = $1
       AND person.slug = 'person'
       AND f.group_id = person.id
       AND f.name IN ('linkedin', 'github', 'portfolio')`,
    [communityId]
  );
}

async function seedDemoCatalogExtras(client, communityId) {
  const { SEED_COMMUNITIES, seedTenantExtras } = require('./communities.cjs');
  const demo = SEED_COMMUNITIES.find((community) => community.slug === 'demo');
  await seedTenantExtras(client, communityId, demo.extras);
}

function listsFor(field) {
  if (field.lists) {
    return field.lists;
  }
  if (field.listFilterable || field.filterable) {
    return LISTS.extraFilter;
  }
  return LISTS.extraDirectoryOnly;
}

async function upsertListFields(client, fieldId, lists) {
  for (const listKey of ['directory', 'showcase']) {
    const spec = lists[listKey] || { filterable: false, placement: 'off' };
    await client.query(
      `INSERT INTO plugin_directory.list_fields (field_id, list_key, filterable, placement)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (field_id, list_key) DO UPDATE SET
         filterable = EXCLUDED.filterable,
         placement = EXCLUDED.placement`,
      [fieldId, listKey, Boolean(spec.filterable), spec.placement || 'off']
    );
  }
}

async function upsertCatalogGroups(client, communityId, groups) {
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
      const row = await client.query(
        `INSERT INTO plugin_directory.fields (
           group_id, name, type, label, description, options, span, required, sort_order,
           storage, column_key, module_id
         ) VALUES (
           $1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11,
           (SELECT id FROM plugin_core.modules WHERE slug = $12)
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
           module_id = EXCLUDED.module_id
         RETURNING id`,
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
          field.module_slug || null,
        ]
      );
      await upsertListFields(client, row.rows[0].id, listsFor(field));
    }
  }
}

module.exports = {
  seedDirectoryCatalog,
  seedDemoCatalogExtras,
  upsertCatalogGroups,
  loc,
  opt,
  listsFor,
  LISTS,
  PLATFORM_CATALOG_GROUPS,
};

