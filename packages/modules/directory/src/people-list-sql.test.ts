import { describe, expect, it } from 'vitest';
import { parseField } from './catalog';
import { peopleListQuery } from './people-list-sql';

const host = parseField({
  name: 'host_at_home',
  type: 'boolean',
  storage: 'attributes',
  filterable: true,
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
    expect(built.params).toEqual(['c1', '{"host_at_home":true}', '%ana%']);
  });

  it('scopes showcase with public_showcase and availability, not cohort', () => {
    const built = peopleListQuery({
      communityId: 'c1',
      searchParams: new URLSearchParams('status=mentor&cohort=not-a-uuid'),
      fields: [host],
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
    expect(built.pageSize).toBe(12);
    expect(built.params.at(-1)).toBe(12);
    expect(built.countText).toContain('count(*)');
  });
});
