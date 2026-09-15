import { parseContacts, parseLanguages, valueAt, type LocalizedText } from '@community/identity';
import { parsePlace, type GeoPlace } from '@community/places';
import type { CatalogField } from '@community/directory';

export type ProfileSources = {
  profile: Record<string, unknown> | null;
  card: Record<string, unknown> | null;
};

export function readFieldValue(field: CatalogField, sources: ProfileSources): unknown {
  if (field.storage === 'attributes') {
    const attrs =
      sources.card?.custom_attributes && typeof sources.card.custom_attributes === 'object'
        ? (sources.card.custom_attributes as Record<string, unknown>)
        : {};
    return attrs[field.name];
  }
  if (field.storage === 'card_column') {
    const key = field.column_key || field.name;
    return sources.card?.[key];
  }
  const key = field.column_key || field.name;
  const profile = sources.profile || {};
  if (key === 'languages') {
    return parseLanguages(profile.languages).map((item) => item.code);
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
  const languageCodes = Array.isArray(values.languages) ? (values.languages as string[]) : [];
  return {
    full_name: String(values.full_name || ''),
    avatar_url: values.avatar_url || null,
    preferred_locale: locale,
    gender: values.gender || null,
    birth_city: (values.birth_city as GeoPlace | null) || null,
    current_city: (values.current_city as GeoPlace | null) || null,
    languages: languageCodes.map((code) => ({
      code,
      proficiency: code === 'pt' ? 'native' : 'fluent',
    })),
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
  return {
    headline: (values.headline as LocalizedText) || [],
    bio: (values.bio as LocalizedText) || [],
    availability_status: values.availability_status || null,
    public_showcase: Boolean(values.public_showcase),
    custom_attributes: attributes,
  };
}
