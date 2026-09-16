import { parseLanguages, pickLocalizedText, sortSpokenLanguages, spokenLanguageLabel } from '@community/identity';
import type { ListDensity, ListField } from './list-fields';
import { isPersonViewSlot, visibleOn } from './list-fields';

export type PersonViewProfile = {
  full_name: string;
  avatar_url: string | null;
  languages: unknown;
  contacts: Record<string, string>;
  headline: unknown;
  bio: unknown;
  availability_status: string | null;
  custom_attributes: Record<string, unknown>;
};

export type PersonView = {
  name: string;
  photoUrl: string | null;
  city: string | null;
  headline: string | null;
  summary: string | null;
  availability: string | null;
  languagesHeading: string | null;
  availabilityHeading: string | null;
  languages: { code: string; proficiency: string; label: string }[];
  facts: { name: string; label: string; values: string[] }[];
  links: { key: string; href: string; label: string }[];
};

function visibleFieldLabel(fields: ListField[], name: string, density: ListDensity, locale: string): string | null {
  const field = fields.find((item) => item.name === name || item.column_key === name);
  if (!field || !visibleOn(field.placement, density)) {
    return null;
  }
  const label = pickLocalizedText(field.label, locale).trim();
  return label || null;
}

function fieldVisible(fields: ListField[], name: string, density: ListDensity) {
  const field = fields.find((item) => item.name === name || item.column_key === name);
  if (!field) {
    return false;
  }
  return visibleOn(field.placement, density);
}

function optionLabel(field: ListField, value: string, locale: string) {
  const option = field.options.find((item) => item.value === value);
  return (option ? pickLocalizedText(option.label, locale) : '') || value;
}

function factValues(field: ListField, raw: unknown, locale: string): string[] | null {
  if (field.type === 'boolean') {
    return raw === true ? [] : null;
  }
  if (field.type === 'checkbox' && Array.isArray(raw)) {
    const labels = raw.map((item) => optionLabel(field, String(item), locale)).filter(Boolean);
    return labels.length ? labels : null;
  }
  if (field.type === 'select' || field.type === 'radio') {
    const value = String(raw ?? '').trim();
    return value ? [optionLabel(field, value, locale)] : null;
  }
  if (typeof raw === 'string') {
    const value = raw.trim();
    return value ? [value] : null;
  }
  return null;
}

export function projectPersonView(input: {
  profile: PersonViewProfile;
  fields: ListField[];
  density: ListDensity;
  locale: string;
  cityLabel: string | null;
  availabilityLabel: string | null;
}): PersonView {
  const { profile, fields, density, locale } = input;
  const languages = fieldVisible(fields, 'languages', density)
    ? sortSpokenLanguages(
        parseLanguages(profile.languages).flatMap((item) => {
          const label = spokenLanguageLabel(item.code, locale);
          return label ? [{ ...item, label }] : [];
        }),
        locale
      )
    : [];
  const facts: PersonView['facts'] = [];
  const links: PersonView['links'] = [];
  for (const field of fields) {
    if (!visibleOn(field.placement, density) || isPersonViewSlot(field)) {
      continue;
    }
    if (field.storage === 'attributes') {
      const values = factValues(field, profile.custom_attributes[field.name], locale);
      if (values) {
        facts.push({ name: field.name, label: pickLocalizedText(field.label, locale) || field.name, values });
      }
    }
  }
  for (const field of fields) {
    const key = field.column_key || '';
    if (!key.startsWith('contacts.') || !visibleOn(field.placement, density)) {
      continue;
    }
    const contactKey = key.slice('contacts.'.length);
    const href = profile.contacts[contactKey];
    if (href) {
      links.push({
        key: contactKey,
        href,
        label: pickLocalizedText(field.label, locale) || contactKey,
      });
    }
  }
  return {
    name: profile.full_name,
    photoUrl: profile.avatar_url,
    city: fieldVisible(fields, 'current_city', density) ? input.cityLabel : null,
    headline: fieldVisible(fields, 'headline', density) ? pickLocalizedText(profile.headline, locale) || null : null,
    summary: fieldVisible(fields, 'bio', density) ? pickLocalizedText(profile.bio, locale) || null : null,
    availability: fieldVisible(fields, 'availability_status', density) ? input.availabilityLabel : null,
    languagesHeading: languages.length ? visibleFieldLabel(fields, 'languages', density, locale) : null,
    availabilityHeading: fieldVisible(fields, 'availability_status', density)
      ? visibleFieldLabel(fields, 'availability_status', density, locale)
      : null,
    languages,
    facts,
    links,
  };
}
