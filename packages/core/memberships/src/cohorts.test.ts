import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
  queryAsOps: vi.fn(),
}));

import { queryAsOps } from '@community/db';
import { createCohort, deleteCohort, InvalidCohortError, setMembershipCohort } from './cohorts';
import { MembershipNotFoundError } from './memberships';

const mockedOps = vi.mocked(queryAsOps);

describe('createCohort', () => {
  beforeEach(() => {
    mockedOps.mockReset();
  });

  it('rejects a blank name', async () => {
    await expect(createCohort('c1', '  ')).rejects.toBeInstanceOf(InvalidCohortError);
    expect(mockedOps).not.toHaveBeenCalled();
  });
});

describe('deleteCohort', () => {
  beforeEach(() => {
    mockedOps.mockReset();
  });

  it('clears memberships then deletes the cohort scoped by community_id (US-0137)', async () => {
    mockedOps.mockResolvedValueOnce({ rows: [] } as never);
    mockedOps.mockResolvedValueOnce({ rows: [{ id: 'h1' }] } as never);
    await deleteCohort('c1', 'h1');
    expect(String(mockedOps.mock.calls[0]?.[0])).toContain('SET cohort_id = NULL');
    expect(String(mockedOps.mock.calls[0]?.[0])).toContain('AND community_id = $2');
    expect(mockedOps.mock.calls[0]?.[1]).toEqual(['h1', 'c1']);
    expect(String(mockedOps.mock.calls[1]?.[0])).toContain('DELETE FROM network_core.cohorts');
  });
});

describe('setMembershipCohort', () => {
  beforeEach(() => {
    mockedOps.mockReset();
  });

  it('throws when clearing a missing membership', async () => {
    mockedOps.mockResolvedValueOnce({ rows: [] } as never);
    await expect(setMembershipCohort('missing', null)).rejects.toBeInstanceOf(MembershipNotFoundError);
  });
});
