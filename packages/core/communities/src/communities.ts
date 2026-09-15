import { query } from '@community/db';

export type CommunityRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
};

export class CommunityNotFoundError extends Error {
  constructor() {
    super('Community not found');
    this.name = 'CommunityNotFoundError';
  }
}

export class DuplicateCommunitySlugError extends Error {
  constructor(slug: string) {
    super(`Duplicate community slug: ${slug}`);
    this.name = 'DuplicateCommunitySlugError';
  }
}

export async function listCommunities(): Promise<CommunityRow[]> {
  const result = await query<CommunityRow>(
    `SELECT id, slug, name, type FROM network_core.communities ORDER BY created_at`
  );
  return result.rows;
}

export async function getCommunity(id: string): Promise<CommunityRow | null> {
  const result = await query<CommunityRow>(
    `SELECT id, slug, name, type FROM network_core.communities WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createCommunity(input: { slug: string; name: string; type?: string }): Promise<CommunityRow> {
  const slug = input.slug.trim().toLowerCase();
  const name = input.name.trim();
  if (!slug || !name) {
    throw new Error('VALIDATION_ERROR');
  }
  try {
    const inserted = await query<CommunityRow>(
      `INSERT INTO network_core.communities (slug, name, type)
       VALUES ($1, $2, $3)
       RETURNING id, slug, name, type`,
      [slug, name, input.type?.trim() || 'alumni']
    );
    return inserted.rows[0];
  } catch (err) {
    const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: string }).code) : '';
    if (code === '23505') {
      throw new DuplicateCommunitySlugError(slug);
    }
    throw err;
  }
}

export async function updateCommunity(
  id: string,
  input: { name: string; type?: string }
): Promise<CommunityRow> {
  const name = input.name.trim();
  const type = input.type?.trim() || 'alumni';
  if (!name) {
    throw new Error('VALIDATION_ERROR');
  }
  const updated = await query<CommunityRow>(
    `UPDATE network_core.communities
     SET name = $2, type = $3
     WHERE id = $1
     RETURNING id, slug, name, type`,
    [id, name, type]
  );
  if (!updated.rows[0]) {
    throw new CommunityNotFoundError();
  }
  return updated.rows[0];
}
