import { describe, expect, it } from 'vitest';
import { memberSurfaceUrl, opsSurfaceUrl } from './surface-urls';

describe('surface-urls', () => {
  it('defaults to local web and admin origins', () => {
    const previousApp = process.env.NEXT_PUBLIC_APP_URL;
    const previousOps = process.env.NEXT_PUBLIC_OPS_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_OPS_URL;
    expect(memberSurfaceUrl()).toBe('http://localhost:3014');
    expect(opsSurfaceUrl()).toBe('http://localhost:3015');
    process.env.NEXT_PUBLIC_APP_URL = previousApp;
    process.env.NEXT_PUBLIC_OPS_URL = previousOps;
  });
});
