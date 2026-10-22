import { effectiveAudience, parseAudience, parseExposure } from '@community/directory';

const PUBLIC_CONTACT_KEYS = ['linkedin', 'github', 'portfolio'] as const;

export type PersonCard = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  current_city: unknown;
  languages: unknown;
  contacts: Record<string, string>;
  headline: unknown;
  bio: unknown;
  custom_attributes: Record<string, unknown>;
  cohort_name?: string | null;
  offerings?: {
    title: string;
    description?: string;
    url?: string | null;
    category_id?: string | null;
    category_other?: string | null;
    featured_on_card?: boolean;
  }[];
};

export function publicContacts(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const source = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of PUBLIC_CONTACT_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.startsWith('https://')) {
      out[key] = value;
    }
  }
  return out;
}

export function publicAttributes(raw: unknown, allowed: string[]): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const source = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in source) {
      out[key] = source[key];
    }
  }
  return out;
}

function audienceAllows(audience: unknown, exposure: unknown, level: 'internal' | 'external' | 'owner') {
  if (level === 'owner') return true;
  const ceiling = parseExposure(exposure);
  const person = parseAudience(audience, 'internal');
  const effective = ceiling ? effectiveAudience(person, ceiling) : person;
  if (!effective) return false;
  if (level === 'external') return effective === 'external';
  return effective === 'internal' || effective === 'external';
}

export function ceilingsFrom(
  fields: { column_key: string | null; name: string; storage: string; exposure: string | null }[]
) {
  const attributes: Record<string, string | null> = {};
  let headline: string | null | undefined;
  let bio: string | null | undefined;
  for (const field of fields) {
    if (field.column_key === 'headline') headline = field.exposure;
    else if (field.column_key === 'bio') bio = field.exposure;
    else if (field.storage === 'attributes') attributes[field.name] = field.exposure;
  }
  return { headline, bio, attributes };
}

export function toPersonCard(
  row: Record<string, unknown>,
  attributeKeys: string[] = [],
  level: 'internal' | 'external' | 'owner' = 'owner',
  ceilings: { headline?: unknown; bio?: unknown; attributes?: Record<string, unknown> } = {}
): PersonCard {
  const hasAudienceMap = Boolean(row.attribute_audience && typeof row.attribute_audience === 'object');
  const audienceMap = hasAudienceMap ? (row.attribute_audience as Record<string, unknown>) : {};
  const attributes = publicAttributes(row.custom_attributes, attributeKeys);
  if (hasAudienceMap) {
    for (const key of Object.keys(attributes)) {
      if (!audienceAllows(audienceMap[key] ?? 'internal', ceilings.attributes?.[key], level)) {
        delete attributes[key];
      }
    }
  }
  return {
    id: String(row.id),
    full_name: String(row.full_name || ''),
    avatar_url: typeof row.avatar_url === 'string' && row.avatar_url ? row.avatar_url : null,
    current_city: row.current_city ?? null,
    languages: row.languages ?? [],
    contacts: publicContacts(row.contacts),
    headline: audienceAllows(row.headline_audience, ceilings.headline, level) ? (row.headline ?? []) : [],
    bio: audienceAllows(row.bio_audience, ceilings.bio, level) ? (row.bio ?? []) : [],
    custom_attributes: attributes,
    cohort_name: typeof row.cohort_name === 'string' && row.cohort_name.trim() ? row.cohort_name.trim() : null,
    offerings: Array.isArray(row.offerings) ? (row.offerings as PersonCard['offerings']) : undefined,
  };
}
