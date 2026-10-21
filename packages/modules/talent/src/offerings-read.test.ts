import { describe, expect, it } from 'vitest';
import { DEFAULT_TALENT_CATEGORY_SEED } from './category-seed';
import { talentListFiltersEnabled, visibleOfferings } from './offerings';

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
