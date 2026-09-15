export class UnknownModuleError extends Error {
  constructor(slug: string) {
    super(`Unknown module: ${slug}`);
    this.name = 'UnknownModuleError';
  }
}

export class UnknownCommunityError extends Error {
  constructor(id: string) {
    super(`Unknown community: ${id}`);
    this.name = 'UnknownCommunityError';
  }
}

type QueryFn = (
  sql: string,
  params?: unknown[]
) => Promise<{ rows: Record<string, unknown>[] }>;

export async function setCommunityModuleEnabled(
  query: QueryFn,
  communityId: string,
  slug: string,
  enabled: boolean
): Promise<{ enabled: boolean }> {
  const community = await query(`SELECT id FROM network_core.communities WHERE id = $1`, [communityId]);
  if (!community.rows[0]) {
    throw new UnknownCommunityError(communityId);
  }
  const mod = await query(`SELECT id FROM plugin_core.modules WHERE slug = $1`, [slug]);
  if (!mod.rows[0]) {
    throw new UnknownModuleError(slug);
  }
  await query(
    `INSERT INTO network_core.community_modules (community_id, module_id, enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (community_id, module_id) DO UPDATE SET enabled = EXCLUDED.enabled`,
    [communityId, mod.rows[0].id, enabled]
  );
  return { enabled };
}

export async function listCommunityModuleStates(
  query: QueryFn,
  communityId: string,
  slugs: string[]
): Promise<{ slug: string; enabled: boolean }[]> {
  const result = await query(
    `SELECT m.slug, COALESCE(cm.enabled, false) AS enabled
     FROM plugin_core.modules m
     LEFT JOIN network_core.community_modules cm
       ON cm.module_id = m.id AND cm.community_id = $1
     WHERE m.slug = ANY($2::text[])
     ORDER BY m.slug`,
    [communityId, slugs]
  );
  return result.rows.map((row) => ({
    slug: String(row.slug),
    enabled: row.enabled === true,
  }));
}
