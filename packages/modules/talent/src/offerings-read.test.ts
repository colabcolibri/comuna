import { describe, expect, it } from 'vitest';
import { visibleOfferings } from './offerings';

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
