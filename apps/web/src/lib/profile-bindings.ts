import { parseAudience, type Audience } from '@community/directory';
import { parseContacts, parseLanguages, valueAt, type LocalizedText } from '@community/identity';
import { parsePlace, type GeoPlace } from '@community/places';
import type { CatalogField, CatalogGroup } from '@community/directory';

export type ProfileSources = {
  profile: Record<string, unknown> | null;
  card: Record<string, unknown> | null;
  membership?: { cohort_id?: string | null } | null;
};

export function readFieldValue(field: CatalogField, sources: ProfileSources): unknown {
  if (field.column_key === 'cohort_id') {
    return sources.membership?.cohort_id || '';
  }
  if (field.storage === 'attributes') {
    const attrs =
      sources.card?.custom_attributes && typeof sources.card.custom_attributes === 'object'
        ? (sources.card.custom_attributes as Record<string, unknown>)
        : {};
    return attrs[field.name];
  }
  if (field.storage === 'card_column') {
    const key = field.column_key || field.name;
    if (key === 'public_directory') {
      return sources.card?.[key] ?? true;
    }
    if (key === 'public_showcase') {
      return sources.card?.[key] ?? false;
    }
    return sources.card?.[key];
  }
  const key = field.column_key || field.name;
  const profile = sources.profile || {};
  if (key === 'languages') {
    return parseLanguages(profile.languages);
  }
  if (key.startsWith('contacts.')) {
    const contacts = parseContacts(profile.contacts);
    const part = key.split('.')[1] as keyof typeof contacts;
    return contacts[part] || '';
  }
  if (key === 'birth_city' || key === 'current_city') {
    return parsePlace(profile[key]);
  }
  return profile[key] ?? '';
}

export function personBodyFromFields(
  fields: CatalogField[],
  values: Record<string, unknown>,
  locale: string
) {
  const contacts = {
    linkedin: String(values.linkedin || ''),
    github: String(values.github || ''),
    portfolio: String(values.portfolio || ''),
  };
  return {
    full_name: String(values.full_name || ''),
    avatar_url: values.avatar_url || null,
    preferred_locale: locale,
    gender: values.gender || null,
    birth_city: (values.birth_city as GeoPlace | null) || null,
    current_city: (values.current_city as GeoPlace | null) || null,
    languages: parseLanguages(values.languages),
    contacts,
  };
}

export function cardBodyFromFields(fields: CatalogField[], values: Record<string, unknown>) {
  const attributes: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.storage === 'attributes' && field.name in values) {
      attributes[field.name] = values[field.name];
    }
  }
  const cohortField = fields.find((field) => field.column_key === 'cohort_id');
  const cohortId = cohortField ? String(values[cohortField.name] || '').trim() : undefined;
  return {
    headline: (values.headline as LocalizedText) || [],
    bio: (values.bio as LocalizedText) || [],
    custom_attributes: attributes,
    public_showcase: values.public_showcase === true,
    ...(cohortField ? { cohort_id: cohortId || null } : {}),
    audiences: {
      headline: parseAudience(values.headline_audience),
      bio: parseAudience(values.bio_audience),
      availability: parseAudience(values.availability_audience),
      attributes: Object.fromEntries(
        Object.keys(attributes).map((key) => [key, parseAudience(values[`audience:${key}`])])
      ),
    },
  };
}

export type CardAudiences = {
  headline: Audience;
  bio: Audience;
  availability: Audience;
  attributes: Record<string, Audience>;
};

export function groupsForScope(groups: CatalogGroup[], scope: 'person' | 'community') {
  return groups
    .map((group) => ({
      ...group,
      fields: group.fields.filter((field) =>
        scope === 'person' ? field.storage === 'person' : field.storage !== 'person'
      ),
    }))
    .filter((group) => group.fields.length > 0);
}
