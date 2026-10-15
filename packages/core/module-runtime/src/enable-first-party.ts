export async function ensureModules(
  query: (sql: string, params?: unknown[]) => Promise<unknown>,
  slugs: string[]
) {
  for (const slug of slugs) {
    await query(
      `INSERT INTO plugin_core.modules (slug, version) VALUES ($1, '1.0.0')
       ON CONFLICT (slug) DO NOTHING`,
      [slug]
    );
  }
}

export async function enableFirstPartyModules(
  query: (sql: string, params?: unknown[]) => Promise<unknown>,
  communityId: string,
  slugs: string[]
) {
  await ensureModules(query, slugs);
  await query(
    `INSERT INTO network_core.community_modules (community_id, module_id, enabled)
     SELECT $1, id, true FROM plugin_core.modules WHERE slug = ANY($2::text[])
     ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = true`,
    [communityId, slugs]
  );
}

export async function ensureDisabledModule(
  query: (sql: string, params?: unknown[]) => Promise<unknown>,
  communityId: string,
  slug: string
) {
  await ensureModules(query, [slug]);
  await query(
    `INSERT INTO network_core.community_modules (community_id, module_id, enabled)
     SELECT $1, id, false FROM plugin_core.modules WHERE slug = $2
     ON CONFLICT (community_id, module_id) DO NOTHING`,
    [communityId, slug]
  );
}
