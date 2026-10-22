import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { listCoordinatorCommunityIds, membershipCommunityId } from './coordinator-scope';

const mockedQuery = vi.mocked(query);

describe('coordinator-scope', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('lists active coordinator community ids', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ community_id: 'c1' }, { community_id: 'c2' }],
      rowCount: 2,
    } as never);
    await expect(listCoordinatorCommunityIds('u1')).resolves.toEqual(['c1', 'c2']);
  });

  it('resolves membership community id', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ community_id: 'c9' }], rowCount: 1 } as never);
    await expect(membershipCommunityId('m1')).resolves.toBe('c9');
  });

  it('returns null when membership is missing', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await expect(membershipCommunityId('missing')).resolves.toBeNull();
  });
});
