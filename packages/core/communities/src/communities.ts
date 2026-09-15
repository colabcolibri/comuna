import { query } from '@community/db';

export const COMMUNITY_TYPES = ['alumni', 'practice_community', 'incubator', 'mentor_network'] as const;
export type CommunityType = (typeof COMMUNITY_TYPES)[number];

export type CommunitySettings = {
  description: string;
  default_locale: 'pt-BR' | 'en';
};

export type CommunityRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  is_public_showcase: boolean;
  settings: CommunitySettings;
};

const COMMUNITY_COLUMNS = 'id, slug, name, type, is_public_showcase, settings';

export function isCommunityType(value: string): value is CommunityType {
  return (COMMUNITY_TYPES as readonly string[]).includes(value);
}

export function parseCommunitySettings(raw: unknown): CommunitySettings {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const description = String(source.description ?? '').trim().slice(0, 500);
  const default_locale = source.default_locale === 'en' ? 'en' : 'pt-BR';
  return { description, default_locale };
}

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

function mapCommunity(row: Omit<CommunityRow, 'settings'> & { settings: unknown }): CommunityRow {
  return { ...row, settings: parseCommunitySettings(row.settings) };
}

export async function listCommunities(): Promise<CommunityRow[]> {
  const result = await query<Omit<CommunityRow, 'settings'> & { settings: unknown }>(
    `SELECT ${COMMUNITY_COLUMNS} FROM network_core.communities ORDER BY created_at`
  );
  return result.rows.map(mapCommunity);
}

export async function listPublicCommunities(): Promise<CommunityRow[]> {
  const result = await query<Omit<CommunityRow, 'settings'> & { settings: unknown }>(
    `SELECT ${COMMUNITY_COLUMNS}
     FROM network_core.communities
     WHERE is_public_showcase = true
     ORDER BY name`
  );
  return result.rows.map(mapCommunity);
}

export async function getCommunity(id: string): Promise<CommunityRow | null> {
  const result = await query<Omit<CommunityRow, 'settings'> & { settings: unknown }>(
    `SELECT ${COMMUNITY_COLUMNS} FROM network_core.communities WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapCommunity(result.rows[0]) : null;
}

export async function getCommunityBySlug(slug: string): Promise<CommunityRow | null> {
  const result = await query<Omit<CommunityRow, 'settings'> & { settings: unknown }>(
    `SELECT ${COMMUNITY_COLUMNS} FROM network_core.communities WHERE slug = $1`,
    [slug.trim().toLowerCase()]
  );
  return result.rows[0] ? mapCommunity(result.rows[0]) : null;
}

export async function createCommunity(input: { slug: string; name: string; type?: string }): Promise<CommunityRow> {
  const slug = input.slug.trim().toLowerCase();
  const name = input.name.trim();
  if (!slug || !name) {
    throw new Error('VALIDATION_ERROR');
  }
  try {
    const type = input.type?.trim() || 'alumni';
    if (!isCommunityType(type)) {
      throw new Error('VALIDATION_ERROR');
    }
    const inserted = await query<Omit<CommunityRow, 'settings'> & { settings: unknown }>(
      `INSERT INTO network_core.communities (slug, name, type)
       VALUES ($1, $2, $3)
       RETURNING ${COMMUNITY_COLUMNS}`,
      [slug, name, type]
    );
    return mapCommunity(inserted.rows[0]);
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
  input: { name: string; type?: string; is_public_showcase?: boolean; settings?: unknown }
): Promise<CommunityRow> {
  const name = input.name.trim();
  const type = input.type?.trim() || 'alumni';
  if (!name || !isCommunityType(type)) {
    throw new Error('VALIDATION_ERROR');
  }
  const existing = await getCommunity(id);
  if (!existing) {
    throw new CommunityNotFoundError();
  }
  const settings = input.settings === undefined ? existing.settings : parseCommunitySettings(input.settings);
  const updated = await query<Omit<CommunityRow, 'settings'> & { settings: unknown }>(
    `UPDATE network_core.communities
     SET name = $2, type = $3, is_public_showcase = coalesce($4, is_public_showcase), settings = $5::jsonb
     WHERE id = $1
     RETURNING ${COMMUNITY_COLUMNS}`,
    [id, name, type, input.is_public_showcase ?? null, JSON.stringify(settings)]
  );
  if (!updated.rows[0]) {
    throw new CommunityNotFoundError();
  }
  return mapCommunity(updated.rows[0]);
}
