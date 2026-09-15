import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  queryAsOps: vi.fn(),
}));

import { queryAsOps } from '@community/db';
import { listNetworkPeople } from './network-people';

const mockedQuery = vi.mocked(queryAsOps);

describe('listNetworkPeople', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('nests seats per person', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'u1',
          email: 'admin@example.com',
          full_name: 'Ops',
          global_role: 'super_admin',
          seats: [
            {
              community_id: 'c1',
              community_name: 'Demo',
              community_slug: 'demo',
              network_role: 'coordinator',
              network_status: 'active',
            },
          ],
        },
      ],
    } as never);
    const people = await listNetworkPeople();
    expect(people[0].seats[0].network_role).toBe('coordinator');
    expect(String(mockedQuery.mock.calls[0]?.[0])).toContain('json_agg');
  });
});
