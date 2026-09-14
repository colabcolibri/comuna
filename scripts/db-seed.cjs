#!/usr/bin/env node
'use strict';

const { Client } = require('pg');
const { loadRootEnv } = require('./load-root-env.cjs');

const MODULES = ['directory', 'showcase', 'contact-mediated'];
const DEMO_MEMBER_COUNT = 40;

function demoMemberEmails(count = DEMO_MEMBER_COUNT) {
  return Array.from({ length: count }, (_, i) => `member${String(i + 1).padStart(2, '0')}@demo.example`);
}

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

    for (const memberEmail of demoMemberEmails()) {
      const member = await client.query(
        `INSERT INTO auth_core.users (email, global_role, status)
         VALUES ($1, 'user', 'active')
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [memberEmail]
      );
      const memberId = member.rows[0].id;
      const n = memberEmail.match(/member(\d+)/)[1];
      await client.query(
        `INSERT INTO person_core.profiles (user_id, full_name, preferred_locale)
         VALUES ($1, $2, 'pt-BR')
         ON CONFLICT (user_id) DO NOTHING`,
        [memberId, `Demo Member ${n}`]
      );
      const membership = await client.query(
        `INSERT INTO network_core.memberships (community_id, user_id, network_role, network_status)
         VALUES ($1, $2, 'member', 'active')
         ON CONFLICT (community_id, user_id) DO UPDATE SET network_status = 'active'
         RETURNING id`,
        [communityId, memberId]
      );
      await client.query(
        `INSERT INTO plugin_directory.cards (membership_id, headline, bio, availability_status, public_showcase)
         VALUES ($1, $2, $3, 'available_for_hire', true)
         ON CONFLICT (membership_id) DO NOTHING`,
        [membership.rows[0].id, `Headline ${n}`, `Bio sintética ${n}`]
      );
    }
    console.log(`seed ok user=${userId} community=${communityId} demo_members=${DEMO_MEMBER_COUNT}`);
  } finally {
    await client.end();
  }
}

async function main() {
  loadRootEnv();
  const url = process.env.DATABASE_URL;
  const email =
    process.env.INITIAL_SUPER_ADMIN_EMAIL ||
    process.env.INITIAL_ADMIN_EMAIL ||
    'admin@example.com';
  if (!url) throw new Error('DATABASE_URL is required');
  await seed(url, email);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { demoMemberEmails, DEMO_MEMBER_COUNT };
