import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
  queryAsOps: vi.fn(),
}));

import { query, queryAsOps } from '@community/db';
import {
  DuplicateMembershipError,
  InvalidNetworkRoleError,
  MembershipNotFoundError,
  UserNotFoundError,
  addExistingMember,
  addMembership,
  listMemberships,
  likeContains,
  searchPeopleOutsideCommunity,
  setNetworkRole,
} from './memberships';

const mockedQuery = vi.mocked(query);
const mockedOps = vi.mocked(queryAsOps);

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

describe('addMembership', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    mockedOps.mockReset();
  });

  it('rejects roles that are not member or coordinator', async () => {
    await expect(addMembership({ communityId: 'c1', userId: 'u1', email: 'a@b.c', role: 'super_admin' })).rejects.toBeInstanceOf(
      InvalidNetworkRoleError
    );
    expect(mockedOps).not.toHaveBeenCalled();
  });

  it('maps a unique violation to DuplicateMembershipError', async () => {
    mockedOps.mockRejectedValueOnce({ code: '23505' });
    await expect(addMembership({ communityId: 'c1', userId: 'u1', email: 'a@b.c' })).rejects.toBeInstanceOf(DuplicateMembershipError);
  });

  it('inserts an active membership', async () => {
    mockedOps.mockResolvedValueOnce({
      rows: [{ id: 'm1', network_role: 'member', network_status: 'active', user_id: 'u1' }],
    } as never);
    await expect(addMembership({ communityId: 'c1', userId: 'u1', email: 'a@b.c' })).resolves.toMatchObject({
      id: 'm1',
      email: 'a@b.c',
      network_status: 'active',
    });
  });
});

describe('addExistingMember', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    mockedOps.mockReset();
  });

  it('rejects an unknown user id', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    await expect(addExistingMember('c1', 'missing')).rejects.toBeInstanceOf(UserNotFoundError);
    expect(mockedOps).not.toHaveBeenCalled();
  });
});

describe('searchPeopleOutsideCommunity', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    mockedOps.mockReset();
  });

  it('does not query when the needle is too short', async () => {
    await expect(searchPeopleOutsideCommunity('c1', 'a')).resolves.toEqual([]);
    expect(mockedOps).not.toHaveBeenCalled();
  });

  it('escapes LIKE wildcards', () => {
    expect(likeContains('a%b_c')).toBe('%a\\%b\\_c%');
  });

  it('searches users without a membership in that community, capped', async () => {
    mockedOps.mockResolvedValueOnce({
      rows: [{ id: 'u2', email: 'b@c.d', full_name: 'B' }],
    } as never);
    await expect(searchPeopleOutsideCommunity('c1', 'marina')).resolves.toEqual([
      { id: 'u2', email: 'b@c.d', full_name: 'B' },
    ]);
    const sql = String(mockedOps.mock.calls[0]?.[0]);
    expect(sql).toContain('NOT EXISTS');
    expect(sql).toContain('LIMIT');
    expect(mockedOps.mock.calls[0]?.[1]?.[3]).toBe(20);
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
