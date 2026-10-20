'use strict';

const OFFERS = [
  {
    category: 'mentorship',
    title: 'Mentoria de produto para quem muda de área',
    description:
      'Uma conversa de 45 minutos para quem está saindo de uma função técnica e quer montar o primeiro ciclo de produto. Sem slide. A pessoa sai com uma pergunta para a semana.',
    url: 'https://example.com/mentoria-produto',
    audience: 'external',
  },
  {
    category: 'project',
    title: 'Mapa de egressos da turma',
    description:
      'Projeto aberto para organizar quem está onde, sem transformar a rede num feed. Procuro quem queira cuidar da ficha e da revisão dos textos.',
    url: 'https://example.com/mapa-egressos',
    audience: 'external',
  },
  {
    category: 'hiring',
    title: 'Vaga de pesquisa em política pública',
    description:
      'Time pequeno, contrato de um ano, em São Paulo. Interessa quem já passou por escola pública ou por avaliação de programa.',
    url: 'https://example.com/vaga-pesquisa',
    audience: 'internal',
  },
  {
    category: 'teaching',
    title: 'Aula aberta de escrita para proposta',
    description:
      'Duas horas para escrever o parágrafo que explica o que você faz e para quem. Material fica com quem participar.',
    url: 'https://example.com/aula-escrita',
    audience: 'external',
  },
  {
    category: 'volunteering',
    title: 'Revisão de texto para projetos da rede',
    description:
      'Leio uma página e devolvo comentário em uma semana. Não reviso currículo nem material comercial.',
    url: null,
    audience: 'external',
  },
  {
    category: 'other',
    other: 'Introdução',
    title: 'Apresentar alguém da turma a um time',
    description:
      'Se a conversa fizer sentido, faço a introdução por escrito. Não encaminho currículo solto.',
    url: null,
    audience: 'internal',
  },
];

async function seedDemoTalents(client, tenants, memberIds) {
  const demo = tenants.demo;
  if (!demo) {
    return;
  }
  await client.query(
    `INSERT INTO plugin_core.modules (slug, version) VALUES ('talent', '1.0.0')
     ON CONFLICT (slug) DO NOTHING`
  );
  await client.query(
    `INSERT INTO network_core.community_modules (community_id, module_id, enabled)
     SELECT $1, id, true FROM plugin_core.modules WHERE slug = 'talent'
     ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = true`,
    [demo.id]
  );
  const people = [...memberIds.entries()].filter(([n]) => {
    const number = Number(n);
    return number <= 48 && number % 2 === 1;
  });
  for (const [n, userId] of people) {
    const membership = await client.query(
      `SELECT id FROM network_core.memberships WHERE community_id = $1 AND user_id = $2`,
      [demo.id, userId]
    );
    const membershipId = membership.rows[0]?.id;
    if (!membershipId) {
      continue;
    }
    const first = OFFERS[Number(n) % OFFERS.length];
    const second = OFFERS[(Number(n) + 2) % OFFERS.length];
    for (const [index, offer] of [first, second].entries()) {
      await client.query(
        `INSERT INTO plugin_talent.offerings
           (membership_id, title, description, url, category_id, category_other, audience, seed_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (membership_id, seed_key) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           url = EXCLUDED.url,
           category_id = EXCLUDED.category_id,
           category_other = EXCLUDED.category_other,
           audience = EXCLUDED.audience`,
        [
          membershipId,
          offer.title,
          offer.description,
          offer.url,
          offer.category,
          offer.other || null,
          offer.audience,
          `seed:offer:${index}`,
        ]
      );
    }
  }
}

module.exports = { seedDemoTalents };
