import { createRequire } from 'node:module';
import { query } from '@community/db';
import { ensureCustomGroup } from './ops-catalog';

const require = createRequire(import.meta.url);
const { seedDirectoryCatalog } = require('../../../../scripts/seed/directory-catalog.cjs') as {
  seedDirectoryCatalog: (client: { query: typeof query }, communityId: string) => Promise<void>;
};

export async function seedCommunityCatalog(communityId: string): Promise<void> {
  await seedDirectoryCatalog({ query }, communityId);
  await ensureCustomGroup(communityId);
}
