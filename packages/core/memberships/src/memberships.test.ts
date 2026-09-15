import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { InvalidNetworkRoleError, MembershipNotFoundError, setNetworkRole } from './memberships';

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
      rows: [{ id: 'm1', network_role: 'coordinator', user_id: 'u1', email: 'a@b.c' }],
    } as never);
    await expect(setNetworkRole('m1', 'coordinator')).resolves.toMatchObject({
      id: 'm1',
      network_role: 'coordinator',
    });
  });
});
