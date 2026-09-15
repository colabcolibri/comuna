export type ModuleSlug = string;

export type ModuleLookup = {
  isEnabled(communityId: string, slug: string): Promise<boolean>;
  listEnabled(communityId: string): Promise<string[]>;
};

export function createIsEnabled(lookup: {
  query: (sql: string, params: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
}): ModuleLookup {
  return {
    async isEnabled(communityId, slug) {
      const result = await lookup.query(
        `SELECT cm.enabled
         FROM network_core.community_modules cm
         JOIN plugin_core.modules m ON m.id = cm.module_id
         WHERE cm.community_id = $1 AND m.slug = $2`,
        [communityId, slug]
      );
      return result.rows[0]?.enabled === true;
    },
    async listEnabled(communityId) {
      const result = await lookup.query(
        `SELECT m.slug
         FROM network_core.community_modules cm
         JOIN plugin_core.modules m ON m.id = cm.module_id
         WHERE cm.community_id = $1 AND cm.enabled = true`,
        [communityId]
      );
      return result.rows.map((row) => String(row.slug));
    },
  };
}
