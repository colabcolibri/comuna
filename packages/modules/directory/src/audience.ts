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

export function audienceVisible(audience: Audience, level: 'internal' | 'external'): boolean {
  if (level === 'external') {
    return audience === 'external';
  }
  return audience === 'internal' || audience === 'external';
}

export function directoryScopeSql(alias = 'c') {
  const levels = `'internal', 'external'`;
  return `(
    ${alias}.headline_audience IN (${levels})
    OR ${alias}.bio_audience IN (${levels})
    OR ${alias}.availability_audience IN (${levels})
    OR EXISTS (
      SELECT 1 FROM jsonb_each_text(COALESCE(${alias}.attribute_audience, '{}'::jsonb)) aud
      WHERE aud.value IN (${levels})
    )
  )`;
}

export function showcaseScopeSql(alias = 'c') {
  return `(
    ${alias}.headline_audience = 'external'
    OR ${alias}.bio_audience = 'external'
    OR ${alias}.availability_audience = 'external'
    OR EXISTS (
      SELECT 1 FROM jsonb_each_text(COALESCE(${alias}.attribute_audience, '{}'::jsonb)) aud
      WHERE aud.value = 'external'
    )
  )`;
}
