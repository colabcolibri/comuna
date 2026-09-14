import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@community/db', () => ({
  query: vi.fn(),
}));

import { query } from '@community/db';
import { consumeOtp, InvalidOtpError } from './consume-otp';
import { hashOtp } from './otp';

const mockedQuery = vi.mocked(query);

describe('consumeOtp', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    process.env.JWT_SECRET = 'test-secret-for-community-platform';
  });

  it('increments attempts and does not return a user on a wrong code', async () => {
    mockedQuery
      .mockResolvedValueOnce({
        rows: [{ id: 'tok', code_hash: hashOtp('111111'), attempts: 0 }],
      } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    await expect(consumeOtp('member@example.com', '000000')).rejects.toBeInstanceOf(InvalidOtpError);
    expect(String(mockedQuery.mock.calls[1]?.[0])).toContain('attempts');
  });
});
