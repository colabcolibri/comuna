#!/usr/bin/env node
'use strict';

const { Client } = require('pg');
const { loadRootEnv } = require('./load-root-env.cjs');
const { pgSsl } = require('./pg-ssl.cjs');

const { seedDirectoryCatalog } = require('./seed-directory-catalog.cjs');
const { DEMO_MEMBER_COUNT, demoMemberEmails, demoPeople, emailFor } = require('./seed-demo-people.cjs');
const {
  SEED_COMMUNITIES,
  communitySlugsFor,
  cohortFor,
  seedTenantExtras,
} = require('./seed-communities.cjs');
const { membershipCard } = require('./seed-membership-cards.cjs');
const { seedDemoAvatarsForPeople, seedDemoAvatarsEnabled } = require('./seed-demo-avatars.cjs');

const MODULES = ['directory', 'showcase', 'contact-mediated'];

async function ensureModules(client) {
  for (const slug of MODULES) {
    await client.query(
      `INSERT INTO plugin_core.modules (slug, version) VALUES ($1, '1.0.0')
       ON CONFLICT (slug) DO NOTHING`,
      [slug]
    );
  }
}

async function upsertCommunity(client, spec) {
  const community = await client.query(
    `INSERT INTO network_core.communities (slug, name, type, is_public_showcase, settings)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name,
       type = EXCLUDED.type,
       is_public_showcase = EXCLUDED.is_public_showcase,
       settings = EXCLUDED.settings
     RETURNING id`,
    [spec.slug, spec.name, spec.type, spec.is_public_showcase, JSON.stringify(spec.settings)]
  );
  const communityId = community.rows[0].id;
  await client.query(
    `INSERT INTO network_core.community_modules (community_id, module_id, enabled)
     SELECT $1, id, true FROM plugin_core.modules
     WHERE slug = ANY($2::text[])
     ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = true`,
    [communityId, MODULES]
  );
  await seedDirectoryCatalog(client, communityId);
  await seedTenantExtras(client, communityId, spec.extras);
  const cohorts = {};
  for (const cohort of spec.cohorts) {
    const existing = await client.query(
      `SELECT id FROM network_core.cohorts WHERE community_id = $1 AND code = $2`,
      [communityId, cohort.code]
    );
    if (existing.rows[0]) {
      await client.query(`UPDATE network_core.cohorts SET name = $2 WHERE id = $1`, [
        existing.rows[0].id,
        cohort.name,
      ]);
      cohorts[cohort.code] = existing.rows[0].id;
      continue;
    }
    const inserted = await client.query(
      `INSERT INTO network_core.cohorts (community_id, name, code)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [communityId, cohort.name, cohort.code]
    );
    cohorts[cohort.code] = inserted.rows[0].id;
  }
  return { id: communityId, cohorts };
}

async function upsertProfile(client, userId, person) {
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
      userId,
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
}

async function seed(url, email) {
  const client = new Client({ connectionString: url, ssl: pgSsl(url) });
  await client.connect();
  try {
    await ensureModules(client);
    const user = await client.query(
      `INSERT INTO auth_core.users (email, global_role, status)
       VALUES ($1, 'super_admin', 'active')
       ON CONFLICT (email) DO UPDATE SET global_role = 'super_admin'
       RETURNING id`,
      [email]
    );
    const userId = user.rows[0].id;
    await client.query(
      `INSERT INTO person_core.profiles (user_id, full_name, preferred_locale)
       VALUES ($1, 'Rita Magalhães', 'pt-BR')
       ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name`,
      [userId]
    );

    const tenants = {};
    for (const spec of SEED_COMMUNITIES) {
      tenants[spec.slug] = await upsertCommunity(client, spec);
      await client.query(
        `INSERT INTO network_core.memberships (community_id, user_id, network_role, network_status)
         VALUES ($1, $2, 'coordinator', 'active')
         ON CONFLICT (community_id, user_id) DO UPDATE SET
           network_status = 'active',
           network_role = EXCLUDED.network_role`,
        [tenants[spec.slug].id, userId]
      );
    }

    const people = demoPeople();
    const memberIds = new Map();

    let membershipCount = 0;
    for (const person of people) {
      const member = await client.query(
        `INSERT INTO auth_core.users (email, global_role, status)
         VALUES ($1, 'user', 'active')
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [emailFor(person)]
      );
      const memberId = member.rows[0].id;
      memberIds.set(person.n, memberId);
      await upsertProfile(client, memberId, person);
      for (const slug of communitySlugsFor(person.n)) {
        const tenant = tenants[slug];
        const spec = SEED_COMMUNITIES.find((row) => row.slug === slug);
        const cohort = cohortFor(person.n, spec);
        const cohortId = cohort ? tenant.cohorts[cohort.code] : null;
        const membership = await client.query(
          `INSERT INTO network_core.memberships (community_id, user_id, network_role, network_status, cohort_id)
           VALUES ($1, $2, 'member', 'active', $3)
           ON CONFLICT (community_id, user_id) DO UPDATE SET
             network_status = 'active',
             network_role = 'member',
             cohort_id = EXCLUDED.cohort_id
           RETURNING id`,
          [tenant.id, memberId, cohortId]
        );
        const card = membershipCard(slug, person);
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
            JSON.stringify(card.headline),
            JSON.stringify(card.bio),
            card.availability,
            card.public_showcase,
            JSON.stringify(card.attributes),
          ]
        );
        membershipCount += 1;
      }
    }
    const avatarCount = await seedDemoAvatarsForPeople(client, people, async (person) => memberIds.get(person.n));
    const demoId = tenants.demo.id;
    const avatarNote = seedDemoAvatarsEnabled() ? ` avatars=${avatarCount}` : '';
    console.log(
      `seed ok user=${userId} communities=${SEED_COMMUNITIES.length} demo=${demoId} people=${DEMO_MEMBER_COUNT} memberships=${membershipCount}${avatarNote}`
    );
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

module.exports = { demoMemberEmails, DEMO_MEMBER_COUNT, communitySlugsFor, SEED_COMMUNITIES };
