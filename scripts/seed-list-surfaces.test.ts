import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { parseListField, projectPersonView } from '@community/directory';

const require = createRequire(import.meta.url);
const { listsFor, LISTS, PLATFORM_CATALOG_GROUPS } = require('./seed-directory-catalog.cjs');
const { SEED_COMMUNITIES } = require('./seed-communities.cjs');
const { demoPeople } = require('./seed-demo-people.cjs');
const { membershipCard, attributesFor } = require('./seed-membership-cards.cjs');

function platformFields() {
  return PLATFORM_CATALOG_GROUPS.flatMap((group) => group.fields);
}

function asListField(field: {
  name: string;
  type: string;
  storage: string;
  column_key?: string;
  label: string;
}, listKey: 'directory' | 'showcase') {
  const policy = listsFor(field)[listKey];
  return parseListField({
    name: field.name,
    type: field.type,
    storage: field.storage,
    column_key: field.column_key || null,
    filterable: policy.filterable,
    placement: policy.placement,
    label: JSON.parse(field.label),
  })!;
}

describe('seed list surfaces', () => {
  it('puts list policy on every platform field', () => {
    const fields = platformFields();
    expect(fields.map((field) => field.name)).toEqual([
      'full_name',
      'avatar_url',
      'gender',
      'birth_city',
      'current_city',
      'languages',
      'linkedin',
      'github',
      'portfolio',
      'headline',
      'bio',
      'availability_status',
      'public_showcase',
    ]);
    for (const field of fields) {
      expect(field.lists, field.name).toEqual(listsFor(field));
    }
    expect(listsFor({ name: 'full_name', lists: LISTS.identity })).toEqual(LISTS.identity);
    expect(listsFor({ name: 'gender', lists: LISTS.pii }).showcase).toEqual({
      filterable: false,
      placement: 'off',
    });
    expect(listsFor({ name: 'bio', lists: LISTS.bio }).directory.placement).toBe('detail');
    expect(listsFor({ name: 'bio', lists: LISTS.bio }).showcase.placement).toBe('card');
    expect(listsFor({ name: 'availability_status', lists: LISTS.availability }).directory.placement).toBe('detail');
    expect(listsFor({ name: 'availability_status', lists: LISTS.availability }).showcase.filterable).toBe(true);
    expect(listsFor({ name: 'availability_status', lists: LISTS.availability }).directory).toEqual({
      filterable: false,
      placement: 'detail',
    });
  });

  it('maps tenant extras with listFilterable onto both lists as detail + filter', () => {
    for (const community of SEED_COMMUNITIES) {
      for (const group of community.extras) {
        for (const field of group.fields) {
          expect(listsFor(field)).toEqual(LISTS.extraFilter);
        }
      }
    }
  });

  it('only writes card attributes that exist on that tenant extra catalog', () => {
    const helena = demoPeople()[0];
    for (const community of SEED_COMMUNITIES) {
      const extraNames = community.extras.flatMap((group) => group.fields.map((field) => field.name));
      const keys = Object.keys(attributesFor(community.slug, helena.n, helena));
      expect(keys.every((key) => extraNames.includes(key)), community.slug).toBe(true);
      expect(keys.sort()).toEqual([...extraNames].sort());
    }
  });

  it('fills showcase card slots and keeps PII and hospitality off the card', () => {
    const helena = demoPeople()[0];
    const card = membershipCard('demo', helena);
    const fields = [
      ...platformFields().map((field) => asListField(field, 'showcase')),
      asListField(
        {
          name: 'host_at_home',
          type: 'boolean',
          storage: 'attributes',
          label: JSON.stringify([{ locale: 'pt-BR', value: 'Recebe em casa' }]),
          listFilterable: true,
        } as never,
        'showcase'
      ),
    ];
    const view = projectPersonView({
      profile: {
        full_name: helena.full_name,
        avatar_url: null,
        languages: helena.languages,
        contacts: helena.contacts,
        headline: card.headline,
        bio: card.bio,
        availability_status: card.availability,
        custom_attributes: card.attributes,
      },
      fields,
      density: 'card',
      locale: 'pt-BR',
      cityLabel: 'São Paulo',
      availabilityLabel: 'Mentoria',
    });
    expect(view.name).toBe('Helena Prado');
    expect(view.city).toBe('São Paulo');
    expect(view.headline).toBeTruthy();
    expect(view.summary).toBeTruthy();
    expect(view.languages.map((item) => item.code)).toEqual(['pt', 'en']);
    expect(view.availability).toBe('Mentoria');
    expect(view.facts).toEqual([]);
    expect(view.links).toEqual([]);
    const detail = projectPersonView({
      profile: {
        full_name: helena.full_name,
        avatar_url: null,
        languages: helena.languages,
        contacts: helena.contacts,
        headline: card.headline,
        bio: card.bio,
        availability_status: card.availability,
        custom_attributes: card.attributes,
      },
      fields,
      density: 'detail',
      locale: 'pt-BR',
      cityLabel: 'São Paulo',
      availabilityLabel: 'Mentoria',
    });
    expect(detail.facts.some((item) => item.name === 'host_at_home')).toBe(true);
    expect(detail.links.map((item) => item.key).sort()).toEqual(['github', 'linkedin', 'portfolio']);
    expect(detail.facts.some((item) => item.name === 'gender')).toBe(false);
  });

  it('hides bio on the directory row and still shows it in the dialog', () => {
    const helena = demoPeople()[0];
    const card = membershipCard('demo', helena);
    const fields = platformFields().map((field) => asListField(field, 'directory'));
    const row = projectPersonView({
      profile: {
        full_name: helena.full_name,
        avatar_url: null,
        languages: helena.languages,
        contacts: helena.contacts,
        headline: card.headline,
        bio: card.bio,
        availability_status: card.availability,
        custom_attributes: {},
      },
      fields,
      density: 'card',
      locale: 'pt-BR',
      cityLabel: 'São Paulo',
      availabilityLabel: 'Mentoria',
    });
    expect(row.summary).toBeNull();
    expect(row.availability).toBeNull();
    expect(row.headline).toBeTruthy();
    const dialog = projectPersonView({
      profile: {
        full_name: helena.full_name,
        avatar_url: null,
        languages: helena.languages,
        contacts: helena.contacts,
        headline: card.headline,
        bio: card.bio,
        availability_status: card.availability,
        custom_attributes: {},
      },
      fields,
      density: 'detail',
      locale: 'pt-BR',
      cityLabel: 'São Paulo',
      availabilityLabel: 'Mentoria',
    });
    expect(dialog.summary).toBeTruthy();
  });
});
