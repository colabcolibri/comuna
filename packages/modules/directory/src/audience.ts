export const AUDIENCES = ['private', 'internal', 'external'] as const;
export type Audience = (typeof AUDIENCES)[number];

export function parseAudience(value: unknown, fallback: Audience = 'private'): Audience {
  return AUDIENCES.includes(value as Audience) ? (value as Audience) : fallback;
}

export function migratedBlockAudience(input: {
  publicDirectory: boolean;
  publicShowcase: boolean;
  hasContent: boolean;
}): Audience {
  if (!input.hasContent) {
    return 'private';
  }
  if (input.publicShowcase) {
    return 'external';
  }
  if (input.publicDirectory) {
    return 'internal';
  }
  return 'private';
}

export const EXPOSURES = ['hidden', 'internal', 'external'] as const;
export type Exposure = (typeof EXPOSURES)[number];

export function parseExposure(value: unknown): Exposure | null {
  return EXPOSURES.includes(value as Exposure) ? (value as Exposure) : null;
}

export function exposureFromPlacement(input: { directory: string; showcase: string }): Exposure {
  if (input.showcase && input.showcase !== 'off') return 'external';
  if (input.directory && input.directory !== 'off') return 'internal';
  return 'hidden';
}

const RANK: Record<Audience, number> = { private: 0, internal: 1, external: 2 };

export function effectiveAudience(person: Audience, exposure: Exposure | null): Audience | null {
  if (!exposure || exposure === 'hidden') return exposure === 'hidden' ? null : person;
  const cap: Audience = exposure === 'internal' ? 'internal' : 'external';
  return RANK[person] > RANK[cap] ? cap : person;
}

export function audienceAllowedByCeiling(person: Audience, exposure: Exposure | null): boolean {
  if (!exposure || exposure === 'hidden') return person === 'private';
  if (exposure === 'internal') return person !== 'external';
  return true;
}

export function audienceVisible(audience: Audience, level: 'internal' | 'external'): boolean {
  if (level === 'external') {
    return audience === 'external';
  }
  return audience === 'internal' || audience === 'external';
}

export function directoryScopeSql(card = 'c', community = 'm.community_id') {
  const levels = `'internal', 'external'`;
  return `(
    (${card}.headline_audience IN (${levels}) AND ${fieldCeiling(community, 'headline', levels)})
    OR (${card}.bio_audience IN (${levels}) AND ${fieldCeiling(community, 'bio', levels)})
    OR (${card}.availability_audience IN (${levels}) AND ${fieldCeiling(community, 'availability_status', levels)})
    OR EXISTS (
      SELECT 1 FROM jsonb_each_text(COALESCE(${card}.attribute_audience, '{}'::jsonb)) aud
      JOIN plugin_directory.fields f ON f.name = aud.key
      JOIN plugin_directory.field_groups g ON g.id = f.group_id AND g.community_id = ${community}
      WHERE aud.value IN (${levels}) AND f.exposure IN (${levels})
    )
  )`;
}

function fieldCeiling(community: string, columnKey: string, min: string) {
  return `EXISTS (
    SELECT 1 FROM plugin_directory.fields f
    JOIN plugin_directory.field_groups g ON g.id = f.group_id
    WHERE g.community_id = ${community}
      AND f.column_key = '${columnKey}'
      AND f.exposure IN (${min})
  )`;
}

export function showcaseScopeSql(card = 'c', community = 'm.community_id') {
  const open = `'external'`;
  return `(
    (${card}.headline_audience = 'external' AND ${fieldCeiling(community, 'headline', open)})
    OR (${card}.bio_audience = 'external' AND ${fieldCeiling(community, 'bio', open)})
    OR (${card}.availability_audience = 'external' AND ${fieldCeiling(community, 'availability_status', open)})
    OR EXISTS (
      SELECT 1 FROM jsonb_each_text(COALESCE(${card}.attribute_audience, '{}'::jsonb)) aud
      JOIN plugin_directory.fields f ON f.name = aud.key
      JOIN plugin_directory.field_groups g ON g.id = f.group_id AND g.community_id = ${community}
      WHERE aud.value = 'external' AND f.exposure = 'external'
    )
  )`;
}
