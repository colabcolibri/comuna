import { listPeopleOutsideCommunity } from '../apps/admin/lib/community-people';

describe('listPeopleOutsideCommunity', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns hits from the community people search', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ id: 'u1', email: 'a@x.com', full_name: 'Ana' }] }),
      })
    );
    await expect(listPeopleOutsideCommunity('c1', 'an')).resolves.toEqual([
      { id: 'u1', email: 'a@x.com', full_name: 'Ana' },
    ]);
    expect(fetch).toHaveBeenCalledWith('/api/admin/communities/c1/people?q=an');
  });

  it('throws when the search is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));
    await expect(listPeopleOutsideCommunity('c1', 'an')).rejects.toThrow('people search failed: 500');
  });
});
