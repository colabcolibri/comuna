#!/usr/bin/env node
'use strict';

const { Client } = require('pg');

const MODULES = ['directory', 'showcase', 'contact-mediated'];

async function seed(url, email) {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const user = await client.query(
      `INSERT INTO auth_core.users (email, global_role, status)
       VALUES ($1, 'super_admin', 'active')
       ON CONFLICT (email) DO UPDATE SET global_role = 'super_admin'
       RETURNING id`,
      [email]
    );
    const community = await client.query(
      `INSERT INTO network_core.communities (slug, name, type, is_public_showcase)
       VALUES ('demo', 'Demo community', 'alumni', true)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );
    const userId = user.rows[0].id;
    const communityId = community.rows[0].id;
    await client.query(
      `INSERT INTO person_core.profiles (user_id, full_name, preferred_locale)
       VALUES ($1, 'Ops', 'pt-BR')
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    for (const slug of MODULES) {
      await client.query(
        `INSERT INTO plugin_core.modules (slug, version) VALUES ($1, '1.0.0')
         ON CONFLICT (slug) DO NOTHING`,
        [slug]
      );
    }
    await client.query(
      `INSERT INTO network_core.community_modules (community_id, module_id, enabled)
       SELECT $1, id, true FROM plugin_core.modules
       ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = true`,
      [communityId]
    );
    console.log(`seed ok user=${userId} community=${communityId}`);
  } finally {
    await client.end();
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  const email = process.env.INITIAL_SUPER_ADMIN_EMAIL || 'ops@community.local';
  if (!url) throw new Error('DATABASE_URL is required');
  await seed(url, email);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
