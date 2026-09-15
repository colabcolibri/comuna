import { FIRST_PARTY_SLUGS } from './is-enabled';

export async function ensureFirstPartyModules(
  query: (sql: string, params?: unknown[]) => Promise<unknown>,
) {
  for (const slug of FIRST_PARTY_SLUGS) {
    await query(
      `INSERT INTO plugin_core.modules (slug, version) VALUES ($1, '1.0.0')
       ON CONFLICT (slug) DO NOTHING`,
      [slug]
    );
  }
}

export async function enableFirstPartyModules(
  query: (sql: string, params?: unknown[]) => Promise<unknown>,
  communityId: string
) {
  await ensureFirstPartyModules(query);
  await query(
    `INSERT INTO network_core.community_modules (community_id, module_id, enabled)
     SELECT $1, id, true FROM plugin_core.modules WHERE slug = ANY($2::text[])
     ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = true`,
    [communityId, [...FIRST_PARTY_SLUGS]]
  );
}
