#!/usr/bin/env node
'use strict';

const { Client } = require('pg');
const { loadRootEnv } = require('./load-root-env.cjs');

const { seedDirectoryCatalog } = require('./seed-directory-catalog.cjs');
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
       WHERE slug = ANY($2::text[])
       ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = true`,
      [communityId, ['directory', 'showcase', 'contact-mediated']]
    );
    await seedDirectoryCatalog(client, communityId);

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
        `INSERT INTO person_core.profiles (
           user_id, full_name, preferred_locale, gender, birth_country, current_country,
           birth_city, current_city, languages
         ) VALUES ($1, $2, 'pt-BR', 'prefer_not', 'BR', 'BR', $3::jsonb, $4::jsonb, $5::jsonb)
         ON CONFLICT (user_id) DO UPDATE SET
           birth_city = EXCLUDED.birth_city,
           current_city = EXCLUDED.current_city,
           languages = EXCLUDED.languages`,
        [
          memberId,
          `Demo Member ${n}`,
          JSON.stringify({
            provider: 'nominatim',
            osm_id: 298285,
            osm_type: 'relation',
            lat: '-23.5505',
            lon: '-46.6333',
            country_code: 'BR',
            label: { 'pt-BR': 'São Paulo', en: 'Sao Paulo' },
          }),
          JSON.stringify({
            provider: 'nominatim',
            osm_id: 298285,
            osm_type: 'relation',
            lat: '-23.5505',
            lon: '-46.6333',
            country_code: 'BR',
            label: { 'pt-BR': 'São Paulo', en: 'Sao Paulo' },
          }),
          JSON.stringify([
            { code: 'pt', proficiency: 'native' },
            { code: 'en', proficiency: 'fluent' },
          ]),
        ]
      );
      const membership = await client.query(
        `INSERT INTO network_core.memberships (community_id, user_id, network_role, network_status)
         VALUES ($1, $2, 'member', 'active')
         ON CONFLICT (community_id, user_id) DO UPDATE SET network_status = 'active'
         RETURNING id`,
        [communityId, memberId]
      );
      await client.query(
        `INSERT INTO plugin_directory.cards (
           membership_id, headline, bio, availability_status, public_showcase, custom_attributes
         ) VALUES ($1, $2::jsonb, $3::jsonb, 'available_for_hire', true, $4::jsonb)
         ON CONFLICT (membership_id) DO UPDATE SET
           headline = EXCLUDED.headline,
           bio = EXCLUDED.bio,
           custom_attributes = EXCLUDED.custom_attributes`,
        [
          membership.rows[0].id,
          JSON.stringify([
            { locale: 'pt-BR', value: `Headline ${n}` },
            { locale: 'en', value: `Member headline ${n}` },
          ]),
          JSON.stringify([
            { locale: 'pt-BR', value: `Bio sintética ${n}` },
            { locale: 'en', value: `Synthetic bio ${n}` },
          ]),
          JSON.stringify({ host_at_home: Number(n) % 2 === 1 }),
        ]
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
