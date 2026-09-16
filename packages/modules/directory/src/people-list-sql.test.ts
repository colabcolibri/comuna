import { describe, expect, it } from 'vitest';
import { parseListField } from './list-fields';
import { peopleListCountriesQuery, peopleListQuery, MAP_PIN_LIMIT } from './people-list-sql';

const host = parseListField({
  name: 'host_at_home',
  type: 'boolean',
  storage: 'attributes',
  filterable: true,
  placement: 'detail',
})!;

const availability = parseListField({
  name: 'availability_status',
  type: 'select',
  storage: 'card_column',
  column_key: 'availability_status',
  filterable: true,
  placement: 'card',
})!;

const languages = parseListField({
  name: 'languages',
  type: 'checkbox',
  storage: 'person',
  column_key: 'languages',
  filterable: true,
  placement: 'card',
})!;

describe('peopleListQuery', () => {
  it('keeps one join graph and AND jsonb containment for facets', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('search=ana&attr.host_at_home=true'),
      fields: [host],
      scope: 'directory',
    });
    expect(built.ok).toBe(true);
    if (built.ok === false) {
      return;
    }
    expect(built.text).toContain('JOIN person_core.profiles p');
    expect(built.text).toContain('JOIN plugin_directory.cards c');
    expect(built.text.match(/JOIN/g)?.length).toBe(2);
    expect(built.text).toContain('custom_attributes @>');
    expect(built.text).toContain("m.network_status = 'active'");
    expect(built.params).toEqual(['c1', '{"host_at_home":true}', '%ana%', 24, 0]);
    expect(built.text).toContain('LIMIT $');
    expect(built.pageSize).toBe(24);
  });

  it('scopes showcase with public_showcase and availability, not cohort', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('status=mentor&cohort=not-a-uuid'),
      fields: [host, availability],
      scope: 'showcase',
    });
    expect(built.ok).toBe(true);
    if (built.ok === false) {
      return;
    }
    expect(built.text).toContain('c.public_showcase = true');
    expect(built.text).toContain('c.availability_status = $');
    expect(built.text).not.toContain('cohort_id');
  });

  it('paginates directory and showcase with the same size rules', () => {
    const directory = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('page=2&size=48'),
      fields: [host],
      scope: 'directory',
    });
    expect(directory.ok && directory.page).toBe(2);
    expect(directory.ok && directory.pageSize).toBe(48);
    expect(directory.ok && directory.params.at(-1)).toBe(48);
  });

  it('paginates the showcase and searches bio', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('search=mentora&page=2'),
      fields: [host],
      scope: 'showcase',
    });
    expect(built.ok).toBe(true);
    if (built.ok === false) {
      return;
    }
    expect(built.text).toContain('c.bio::text ILIKE');
    expect(built.text).toContain('LIMIT $');
    expect(built.page).toBe(2);
    expect(built.pageSize).toBe(24);
    expect(built.params.at(-2)).toBe(24);
    expect(built.params.at(-1)).toBe(24);
    expect(built.countText).toContain('count(*)');
  });

  it('accepts showcase size 48 and rejects 12', () => {
    const allowed = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('size=48'),
      fields: [host],
      scope: 'showcase',
    });
    const rejected = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('size=12'),
      fields: [host],
      scope: 'showcase',
    });
    expect(allowed.ok && allowed.pageSize).toBe(48);
    expect(rejected.ok && rejected.pageSize).toBe(24);
  });

  it('ignores showcase status when availability is not filterable', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('status=mentor'),
      fields: [host],
      scope: 'showcase',
    });
    expect(built.ok).toBe(true);
    if (built.ok === false) {
      return;
    }
    expect(built.text).not.toContain('availability_status =');
  });

  it('filters by spoken language codes when languages are filterable', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('lang=pt,en,xx'),
      fields: [languages],
      scope: 'directory',
    });
    expect(built.ok).toBe(true);
    if (built.ok === false) {
      return;
    }
    expect(built.text).toContain('p.languages @>');
    expect((built.text.match(/p\.languages @>/g) || []).length).toBe(2);
    expect(built.params).toContain('[{"code":"pt"}]');
    expect(built.params).toContain('[{"code":"en"}]');
  });

  it('ignores language filter when languages are not filterable', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('lang=pt'),
      fields: [{ ...languages, filterable: false }],
      scope: 'showcase',
    });
    expect(built.ok).toBe(true);
    if (built.ok === false) {
      return;
    }
    expect(built.text).not.toContain('p.languages @>');
  });

  it('applies directory status when availability is filterable on that list', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('status=mentor'),
      fields: [availability],
      scope: 'directory',
    });
    expect(built.ok).toBe(true);
    if (built.ok === false) {
      return;
    }
    expect(built.text).toContain('c.availability_status = $');
  });

  it('filters directory by country and ignores junk codes', () => {
    const ok = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('country=br'),
      fields: [host],
      scope: 'directory',
    });
    const junk = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('country=brasil'),
      fields: [host],
      scope: 'directory',
    });
    expect(ok.ok && ok.text).toContain('p.current_country = $');
    expect(ok.ok && ok.params).toContain('BR');
    expect(junk.ok && junk.text).not.toContain('current_country =');
  });

  it('applies radius around near lat,lon', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('near=38.72,-9.14&radius=50'),
      fields: [host],
      scope: 'directory',
    });
    expect(built.ok).toBe(true);
    if (built.ok === false) {
      return;
    }
    expect(built.text).toContain('6371 * acos');
    expect(built.text).not.toContain('$LAT');
    expect(built.text).not.toContain('$LON');
    expect((built.text.match(/radians\(\$2::float\)/g) || []).length).toBe(2);
    expect(built.params).toContain(38.72);
    expect(built.params).toContain(-9.14);
    expect(built.params).toContain(50);
  });

  it('loads a single map page up to the pin cap', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('view=map&page=3&size=48'),
      fields: [host],
      scope: 'directory',
    });
    expect(built.ok && built.page).toBe(1);
    expect(built.ok && built.pageSize).toBe(MAP_PIN_LIMIT);
    expect(built.ok && built.params.at(-2)).toBe(MAP_PIN_LIMIT);
    expect(built.ok && built.params.at(-1)).toBe(0);
  });

  it('lists distinct countries without search or radius', () => {
    const built = peopleListCountriesQuery({ communityId: 'c1', scope: 'directory' });
    expect(built.text).toContain('DISTINCT p.current_country');
    expect(built.text).not.toContain('ILIKE');
    expect(built.text).not.toContain('6371');
    expect(built.params).toEqual(['c1']);
  });
});
