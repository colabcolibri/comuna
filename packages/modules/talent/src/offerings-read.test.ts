import { describe, expect, it } from 'vitest';
import { DEFAULT_TALENT_CATEGORY_SEED } from './category-seed';
import { parseOffering, talentListFiltersEnabled, visibleOfferings } from './offerings';

const CATEGORY_RULES = DEFAULT_TALENT_CATEGORY_SEED.map((item) => ({
  id: item.id,
  allowsOtherText: item.allowsOtherText,
}));

const rows = [
  { title: 'privado', audience: 'private' },
  { title: 'interno', audience: 'internal' },
  { title: 'externo', audience: 'external' },
];

describe('visibleOfferings', () => {
  it('hides private offers from members and coordinators', () => {
    expect(visibleOfferings(rows, 'internal').map((row) => row.title)).toEqual(['interno', 'externo']);
  });

  it('shows only external offers on the showcase', () => {
    expect(visibleOfferings(rows, 'external').map((row) => row.title)).toEqual(['externo']);
  });

  it('returns every offer to the owner', () => {
    expect(visibleOfferings(rows, 'owner')).toHaveLength(3);
  });
});

describe('talentListFiltersEnabled', () => {
  it('is off when the talent module is disabled', () => {
    expect(talentListFiltersEnabled({ talentOn: false, ceiling: 'external', surface: 'directory' })).toBe(false);
  });

  it('is off on directory when exposure is hidden', () => {
    expect(talentListFiltersEnabled({ talentOn: true, ceiling: 'hidden', surface: 'directory' })).toBe(false);
  });

  it('is on on directory when talent is enabled and not hidden', () => {
    expect(talentListFiltersEnabled({ talentOn: true, ceiling: 'internal', surface: 'directory' })).toBe(true);
  });

  it('is off on showcase unless exposure is external', () => {
    expect(talentListFiltersEnabled({ talentOn: true, ceiling: 'internal', surface: 'showcase' })).toBe(false);
    expect(talentListFiltersEnabled({ talentOn: true, ceiling: 'external', surface: 'showcase' })).toBe(true);
  });
});

describe('parseOffering URL normalization (US-0148)', () => {
  it('accepts @instagram, WhatsApp phone numbers, and bare domains while rejecting unsafe schemes', () => {
    const ig = parseOffering({ title: 'Mentoria', categoryId: 'mentorship', url: '@caos.prestes' }, CATEGORY_RULES);
    expect(ig.ok && ig.value.url).toBe('https://instagram.com/caos.prestes');

    const wa = parseOffering({ title: 'Mentoria', categoryId: 'mentorship', url: '(11) 98066-0003' }, CATEGORY_RULES);
    expect(wa.ok && wa.value.url).toBe('https://wa.me/5511980660003');

    const bare = parseOffering({ title: 'Mentoria', categoryId: 'mentorship', url: 'www.exemplo.org' }, CATEGORY_RULES);
    expect(bare.ok && bare.value.url).toBe('https://www.exemplo.org');

    const bad = parseOffering({ title: 'Mentoria', categoryId: 'mentorship', url: 'javascript:alert(1)' }, CATEGORY_RULES);
    expect(bad.ok).toBe(false);
  });
});
