import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { runningDevMessage, ADMIN_PORT, WEB_PORT } = require('./dev-web.cjs');

describe('dev-web', () => {
  it('explains that demo needs a single next dev instance', () => {
    process.env.DATABASE_READ_ONLY = '1';
    const text = runningDevMessage({ pid: 11167, port: 3014 }, 3014);
    expect(text).toContain('3016 não funciona');
    expect(text).toContain('pnpm dev:demo');
    expect(text).toContain('11167');
    delete process.env.DATABASE_READ_ONLY;
  });

  it('reserves admin port in docs constants', () => {
    expect(WEB_PORT).toBe(3014);
    expect(ADMIN_PORT).toBe(3015);
  });
});
