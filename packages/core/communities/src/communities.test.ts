import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { DuplicateCommunitySlugError, createCommunity, listCommunities } from './communities';

const mockedQuery = vi.mocked(query);

describe('communities', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('lists rows from network_core.communities', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'c1', slug: 'demo', name: 'Demo', type: 'alumni' }],
    } as never);
    await expect(listCommunities()).resolves.toEqual([
      { id: 'c1', slug: 'demo', name: 'Demo', type: 'alumni' },
    ]);
  });

  it('maps unique slug conflicts to DuplicateCommunitySlugError', async () => {
    mockedQuery.mockRejectedValueOnce({ code: '23505' });
    await expect(createCommunity({ slug: 'demo', name: 'Demo' })).rejects.toBeInstanceOf(
      DuplicateCommunitySlugError
    );
  });
});
