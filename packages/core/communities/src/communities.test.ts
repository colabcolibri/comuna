import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { CommunityNotFoundError, DuplicateCommunitySlugError, createCommunity, getCommunityBySlug, listCommunities, listPublicCommunities, updateCommunity } from './communities';

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

  it('lists only communities marked public', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'c1', slug: 'demo', name: 'Demo', type: 'alumni', is_public_showcase: true }],
    } as never);
    await expect(listPublicCommunities()).resolves.toHaveLength(1);
    expect(String(mockedQuery.mock.calls[0]?.[0])).toContain('is_public_showcase = true');
  });

  it('maps unique slug conflicts to DuplicateCommunitySlugError', async () => {
    mockedQuery.mockRejectedValueOnce({ code: '23505' });
    await expect(createCommunity({ slug: 'demo', name: 'Demo' })).rejects.toBeInstanceOf(
      DuplicateCommunitySlugError
    );
  });

  it('updates name and type for an existing community', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'c1', slug: 'demo', name: 'Nova', type: 'cohort' }],
    } as never);
    await expect(updateCommunity('c1', { name: 'Nova', type: 'cohort' })).resolves.toMatchObject({
      name: 'Nova',
      type: 'cohort',
    });
  });

  it('throws when updating a missing community', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await expect(updateCommunity('missing', { name: 'X' })).rejects.toBeInstanceOf(CommunityNotFoundError);
  });

  it('loads a community by slug', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'c1', slug: 'demo', name: 'Demo', type: 'alumni' }],
    } as never);
    await expect(getCommunityBySlug('Demo')).resolves.toMatchObject({ slug: 'demo' });
    expect(mockedQuery.mock.calls[0]?.[1]).toEqual(['demo']);
  });
});
