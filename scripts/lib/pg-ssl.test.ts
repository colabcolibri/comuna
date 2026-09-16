import { createRequire } from 'node:module';
import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { pgSsl } = require('./pg-ssl.cjs');

describe('pgSsl', () => {
  const previous = {
    PGSSL: process.env.PGSSL,
    PGSSL_REJECT_UNAUTHORIZED: process.env.PGSSL_REJECT_UNAUTHORIZED,
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  };

  afterEach(() => {
    process.env.PGSSL = previous.PGSSL;
    process.env.PGSSL_REJECT_UNAUTHORIZED = previous.PGSSL_REJECT_UNAUTHORIZED;
    process.env.RAILWAY_ENVIRONMENT = previous.RAILWAY_ENVIRONMENT;
  });

  it('stays off for local docker urls', () => {
    delete process.env.PGSSL;
    delete process.env.RAILWAY_ENVIRONMENT;
    expect(pgSsl('postgresql://postgres:postgres@localhost:5433/alumni_db')).toBeUndefined();
  });

  it('turns on for railway or sslmode=require', () => {
    delete process.env.PGSSL;
    process.env.RAILWAY_ENVIRONMENT = 'production';
    expect(pgSsl('postgresql://x:y@host/db')).toEqual({ rejectUnauthorized: false });
    delete process.env.RAILWAY_ENVIRONMENT;
    expect(pgSsl('postgresql://x:y@host/db?sslmode=require')).toEqual({ rejectUnauthorized: false });
  });
});
