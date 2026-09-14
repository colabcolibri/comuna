import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { issueOtp, RateLimitError } from './issue-otp';

const mockedQuery = vi.mocked(query);

describe('issueOtp', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('throws RateLimitError when three tokens already exist in the last minute', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ n: 3 }] } as never);
    await expect(issueOtp('member@example.com')).rejects.toBeInstanceOf(RateLimitError);
  });

  it('inserts a hashed token and does not return a payload with a plaintext key', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ n: 0 }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    const code = await issueOtp('member@example.com');
    expect(code).toMatch(/^\d{6}$/);
    const insertSql = String(mockedQuery.mock.calls[1]?.[0]);
    expect(insertSql).toContain('code_hash');
    const params = mockedQuery.mock.calls[1]?.[1] as string[];
    expect(params[1]).not.toBe(code);
    expect(params[1]).toHaveLength(64);
  });
});
