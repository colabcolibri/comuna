import { parseField } from './catalog';
import {
  listedAttributeNames,
  parseListField,
  showcaseFieldForbidden,
  visibleOn,
} from './list-fields';
import { projectPersonView } from './list-view';

const host = parseListField({
  name: 'host_at_home',
  type: 'boolean',
  storage: 'attributes',
  filterable: true,
  placement: 'detail',
  label: [{ locale: 'pt-BR', value: 'Recebe em casa' }],
})!;

describe('list fields', () => {
  it('treats card as a subset of detail', () => {
    expect(visibleOn('off', 'card')).toBe(false);
    expect(visibleOn('detail', 'card')).toBe(false);
    expect(visibleOn('card', 'card')).toBe(true);
    expect(visibleOn('detail', 'detail')).toBe(true);
    expect(visibleOn('card', 'detail')).toBe(true);
  });

  it('forbids gender on the showcase', () => {
    expect(showcaseFieldForbidden({ name: 'gender', column_key: 'gender' })).toBe(true);
    expect(showcaseFieldForbidden({ name: 'headline', column_key: 'headline' })).toBe(false);
  });

  it('lists only placed attributes for the payload', () => {
    expect(listedAttributeNames([host, { ...host, name: 'hidden', placement: 'off' }])).toEqual(['host_at_home']);
  });
});

describe('projectPersonView', () => {
  const profile = {
    full_name: 'Marina Silva',
    avatar_url: null,
    languages: [{ code: 'pt', proficiency: 'native' as const }],
    contacts: { linkedin: 'https://linkedin.com/in/demo' },
    headline: [{ locale: 'pt-BR', value: 'Produto' }],
    bio: [{ locale: 'pt-BR', value: 'Mentora.' }],
    availability_status: 'mentor',
    custom_attributes: { host_at_home: true },
  };

  const fields = [
    parseListField({ name: 'full_name', type: 'text', storage: 'person', column_key: 'full_name', placement: 'card' })!,
    parseListField({
      name: 'languages',
      type: 'checkbox',
      storage: 'person',
      column_key: 'languages',
      placement: 'card',
    })!,
    parseListField({
      name: 'headline',
      type: 'localized_text',
      storage: 'card_column',
      column_key: 'headline',
      placement: 'card',
    })!,
    parseListField({
      name: 'bio',
      type: 'localized_text',
      storage: 'card_column',
      column_key: 'bio',
      placement: 'card',
    })!,
    parseListField({
      name: 'linkedin',
      type: 'url',
      storage: 'person',
      column_key: 'contacts.linkedin',
      placement: 'detail',
      label: [{ locale: 'pt-BR', value: 'LinkedIn' }],
    })!,
    host,
  ];

  it('keeps languages out of facts and links off the card', () => {
    const card = projectPersonView({
      profile,
      fields,
      density: 'card',
      locale: 'pt-BR',
      cityLabel: 'São Paulo',
      availabilityLabel: 'Mentoria',
    });
    expect(card.languages.map((item) => item.label)).toEqual(['Português']);
    expect(card.facts).toEqual([]);
    expect(card.links).toEqual([]);
    expect(card.headline).toBe('Produto');
    const detail = projectPersonView({
      profile,
      fields,
      density: 'detail',
      locale: 'pt-BR',
      cityLabel: 'São Paulo',
      availabilityLabel: 'Mentoria',
    });
    expect(detail.facts[0]?.value).toBe('Recebe em casa');
    expect(detail.links[0]?.href).toContain('linkedin');
  });
});

describe('parseField', () => {
  it('does not read list filterable from the catalog field', () => {
    expect(parseField({ name: 'x', type: 'boolean', storage: 'attributes', filterable: true })?.name).toBe('x');
  });
});
