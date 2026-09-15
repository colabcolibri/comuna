import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { InvalidNetworkRoleError, MembershipNotFoundError, listMemberships, setNetworkRole } from './memberships';

const mockedQuery = vi.mocked(query);

describe('setNetworkRole', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('rejects roles that are not member or coordinator', async () => {
    await expect(setNetworkRole('m1', 'super_admin')).rejects.toBeInstanceOf(InvalidNetworkRoleError);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('throws when the membership id does not exist', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await expect(setNetworkRole('missing', 'coordinator')).rejects.toBeInstanceOf(MembershipNotFoundError);
  });

  it('returns the updated membership', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 'm1', network_role: 'coordinator', network_status: 'active', user_id: 'u1', email: 'a@b.c' }],
    } as never);
    await expect(setNetworkRole('m1', 'coordinator')).resolves.toMatchObject({
      id: 'm1',
      network_role: 'coordinator',
    });
  });
});

describe('listMemberships', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('returns memberships for a community ordered by email', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        { id: 'm1', network_role: 'member', network_status: 'active', user_id: 'u1', email: 'a@b.c' },
      ],
    } as never);
    await expect(listMemberships('c1')).resolves.toHaveLength(1);
    expect(String(mockedQuery.mock.calls[0]?.[0])).toContain('ORDER BY u.email');
  });
});
