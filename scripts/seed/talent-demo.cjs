'use strict';

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
  const examples = [
    { n: 1, seedKey: 'seed:external', audience: 'external', title: 'Mentoria aberta' },
    { n: 2, seedKey: 'seed:internal', audience: 'internal', title: 'Projeto da casa' },
    { n: 1, seedKey: 'seed:private', audience: 'private', title: 'Rascunho privado' },
  ];
  for (const example of examples) {
    const userId = memberIds.get(example.n);
    if (!userId) {
      continue;
    }
    const membership = await client.query(
      `SELECT id FROM network_core.memberships WHERE community_id = $1 AND user_id = $2`,
      [demo.id, userId]
    );
    const membershipId = membership.rows[0]?.id;
    if (!membershipId) {
      continue;
    }
    await client.query(
      `INSERT INTO plugin_talent.offerings
         (membership_id, title, description, url, category_id, category_other, audience, seed_key)
       VALUES ($1, $2, '', NULL, 'mentorship', NULL, $3, $4)
       ON CONFLICT (membership_id, seed_key) DO UPDATE SET
         title = EXCLUDED.title,
         audience = EXCLUDED.audience`,
      [membershipId, example.title, example.audience, example.seedKey]
    );
  }
}

module.exports = { seedDemoTalents };
