import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { runningDevMessage, ADMIN_PORT, WEB_PORT } = require('./admin.cjs');

describe('dev-admin', () => {
  it('explains that demo needs a single next dev instance', () => {
    process.env.DATABASE_READ_ONLY = '1';
    const text = runningDevMessage({ pid: 22201, port: 3015 }, 3015);
    expect(text).toContain('3016 não funciona');
    expect(text).toContain('pnpm dev:admin:demo');
    expect(text).toContain('22201');
    delete process.env.DATABASE_READ_ONLY;
  });

  it('reserves web port in docs constants', () => {
    expect(WEB_PORT).toBe(3014);
    expect(ADMIN_PORT).toBe(3015);
  });
});
