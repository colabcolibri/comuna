import { getPool, resetPoolForTests } from './pool';

describe('getPool', () => {
  const previous = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = previous;
    resetPoolForTests();
  });

  it('throws when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;
    expect(() => getPool()).toThrow(/DATABASE_URL/);
  });
});
