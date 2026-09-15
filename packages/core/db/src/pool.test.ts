import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./load-root-env', () => ({
  loadRootEnv: () => undefined,
}));

import { getPool, resetPoolForTests } from './pool';

describe('getPool', () => {
  const previous = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = previous;
    resetPoolForTests();
  });

  it('throws when DATABASE_URL is missing', () => {
    resetPoolForTests();
    delete process.env.DATABASE_URL;
    expect(() => getPool()).toThrow(/DATABASE_URL/);
  });
});
