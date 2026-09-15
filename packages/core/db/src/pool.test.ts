import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./load-root-env', () => ({
  loadRootEnv: () => undefined,
}));

import { getPool, poolConfig, resetPoolForTests } from './pool';

describe('getPool', () => {
  const previous = process.env.DATABASE_URL;
  const previousReadOnly = process.env.DATABASE_READ_ONLY;
  const previousRailway = process.env.RAILWAY_ENVIRONMENT;
  const previousPgssl = process.env.PGSSL;

  afterEach(() => {
    process.env.DATABASE_URL = previous;
    process.env.DATABASE_READ_ONLY = previousReadOnly;
    process.env.RAILWAY_ENVIRONMENT = previousRailway;
    process.env.PGSSL = previousPgssl;
    resetPoolForTests();
  });

  it('throws when DATABASE_URL is missing', () => {
    resetPoolForTests();
    delete process.env.DATABASE_URL;
    expect(() => getPool()).toThrow(/DATABASE_URL/);
  });

  it('opens a read-only session when DATABASE_READ_ONLY=1', () => {
    delete process.env.RAILWAY_ENVIRONMENT;
    delete process.env.PGSSL;
    process.env.DATABASE_READ_ONLY = '1';
    expect(poolConfig('postgresql://postgres:postgres@localhost:5433/alumni_db').options).toBe(
      '-c default_transaction_read_only=on'
    );
  });

  it('enables ssl on railway without changing local urls', () => {
    delete process.env.DATABASE_READ_ONLY;
    delete process.env.PGSSL;
    delete process.env.RAILWAY_ENVIRONMENT;
    expect(poolConfig('postgresql://postgres:postgres@localhost:5433/alumni_db').ssl).toBeUndefined();
    process.env.RAILWAY_ENVIRONMENT = 'production';
    expect(poolConfig('postgresql://x:y@host/db').ssl).toEqual({ rejectUnauthorized: false });
  });
});
