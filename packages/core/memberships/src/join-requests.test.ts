import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  queryAsMember: vi.fn(),
}));

import { queryAsMember } from '@community/db';
import { DuplicateMembershipError } from './memberships';
import { JoinNotAllowedError, decideJoinRequest, findMyMembership, requestJoin } from './join-requests';

const mockedMember = vi.mocked(queryAsMember);

describe('requestJoin', () => {
  beforeEach(() => {
    mockedMember.mockReset();
  });

  it('inserts pending_approval for a person without a seat', async () => {
    mockedMember
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({
        rows: [{ id: 'm1', network_role: 'member', network_status: 'pending_approval' }],
      } as never);
    await expect(requestJoin('c1', 'u1')).resolves.toMatchObject({
      network_status: 'pending_approval',
      network_role: 'member',
    });
    expect(String(mockedMember.mock.calls[1]?.[1])).toContain('pending_approval');
  });

  it('rejects a second request for the same community', async () => {
    mockedMember.mockResolvedValueOnce({
      rows: [{ id: 'm1', network_role: 'member', network_status: 'pending_approval' }],
    } as never);
    await expect(requestJoin('c1', 'u1')).rejects.toBeInstanceOf(DuplicateMembershipError);
  });
});

describe('findMyMembership', () => {
  beforeEach(() => {
    mockedMember.mockReset();
  });

  it('returns null when the person has no row', async () => {
    mockedMember.mockResolvedValueOnce({ rows: [] } as never);
    await expect(findMyMembership('c1', 'u1')).resolves.toBeNull();
  });
});

describe('decideJoinRequest', () => {
  beforeEach(() => {
    mockedMember.mockReset();
  });

  it('approves a pending row', async () => {
    mockedMember.mockResolvedValueOnce({ rows: [{ id: 'm1' }] } as never);
    await expect(decideJoinRequest({ userId: 'coord', communityId: 'c1' }, 'm1', 'approve')).resolves.toEqual({
      status: 'active',
    });
  });

  it('rejects when there is no community context', async () => {
    await expect(decideJoinRequest({ userId: 'coord', communityId: null }, 'm1', 'approve')).rejects.toBeInstanceOf(
      JoinNotAllowedError
    );
    expect(mockedMember).not.toHaveBeenCalled();
  });
});
