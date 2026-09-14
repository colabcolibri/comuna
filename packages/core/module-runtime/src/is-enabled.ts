export const FIRST_PARTY_SLUGS = ['directory', 'showcase', 'contact-mediated'] as const;

export type ModuleSlug = (typeof FIRST_PARTY_SLUGS)[number];

export type ModuleLookup = {
  isEnabled(communityId: string, slug: string): Promise<boolean>;
};

export function createIsEnabled(lookup: {
  query: (sql: string, params: unknown[]) => Promise<{ rows: { enabled: boolean }[] }>;
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
  };
}
