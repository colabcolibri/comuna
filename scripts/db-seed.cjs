#!/usr/bin/env node
'use strict';

const { Client } = require('pg');
const { loadRootEnv } = require('./load-root-env.cjs');

const { seedDirectoryCatalog, seedDemoCatalogExtras } = require('./seed-directory-catalog.cjs');
const { DEMO_MEMBER_COUNT, demoMemberEmails, demoPeople, emailFor } = require('./seed-demo-people.cjs');
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
      `INSERT INTO network_core.communities (slug, name, type, is_public_showcase, settings)
       VALUES (
         'demo',
         'Alumni Instituto Atlântico',
         'alumni',
         true,
         '{"description":"","showcase_title":"Pessoas da rede","showcase_description":"Quem estudou, ensinou ou construiu com o Instituto Atlântico e escolheu aparecer aqui.","default_locale":"pt-BR"}'::jsonb
       )
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         settings = network_core.communities.settings || EXCLUDED.settings
       RETURNING id`
    );
    const userId = user.rows[0].id;
    const communityId = community.rows[0].id;
    await client.query(
      `INSERT INTO person_core.profiles (user_id, full_name, preferred_locale)
       VALUES ($1, 'Rita Magalhães', 'pt-BR')
       ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name`,
      [userId]
    );
    await client.query(
      `INSERT INTO network_core.memberships (community_id, user_id, network_role, network_status)
       VALUES ($1, $2, 'coordinator', 'active')
       ON CONFLICT (community_id, user_id) DO UPDATE SET
         network_status = 'active',
         network_role = EXCLUDED.network_role`,
      [communityId, userId]
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
      [communityId, MODULES]
    );
    await seedDirectoryCatalog(client, communityId);
    await seedDemoCatalogExtras(client, communityId);

    for (const person of demoPeople()) {
      const memberEmail = emailFor(person);
      const member = await client.query(
        `INSERT INTO auth_core.users (email, global_role, status)
         VALUES ($1, 'user', 'active')
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [memberEmail]
      );
      const memberId = member.rows[0].id;
      await client.query(
        `INSERT INTO person_core.profiles (
           user_id, full_name, preferred_locale, gender, birth_country, current_country,
           birth_city, current_city, languages, contacts
         ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb)
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           preferred_locale = EXCLUDED.preferred_locale,
           gender = EXCLUDED.gender,
           birth_country = EXCLUDED.birth_country,
           current_country = EXCLUDED.current_country,
           birth_city = EXCLUDED.birth_city,
           current_city = EXCLUDED.current_city,
           languages = EXCLUDED.languages,
           contacts = EXCLUDED.contacts`,
        [
          memberId,
          person.full_name,
          person.preferred_locale,
          person.gender,
          person.birth_city.country_code,
          person.current_city.country_code,
          JSON.stringify(person.birth_city),
          JSON.stringify(person.current_city),
          JSON.stringify(person.languages),
          JSON.stringify(person.contacts || {}),
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
         ) VALUES ($1, $2::jsonb, $3::jsonb, $4, $5, $6::jsonb)
         ON CONFLICT (membership_id) DO UPDATE SET
           headline = EXCLUDED.headline,
           bio = EXCLUDED.bio,
           availability_status = EXCLUDED.availability_status,
           public_showcase = EXCLUDED.public_showcase,
           custom_attributes = EXCLUDED.custom_attributes`,
        [
          membership.rows[0].id,
          JSON.stringify(person.headline),
          JSON.stringify(person.bio),
          person.availability,
          person.public_showcase,
          JSON.stringify({ host_at_home: Boolean(person.host_at_home) }),
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
