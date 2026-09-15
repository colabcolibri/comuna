import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { isDatabaseReadOnly, readOnlyBlockedResponse } from './read-only';
import { READ_ONLY_ERROR_CODE, isReadOnlyErrorPayload } from './read-only-error';

describe('isReadOnlyErrorPayload', () => {
  it('recognizes the proxy envelope', () => {
    expect(isReadOnlyErrorPayload({ error: { code: READ_ONLY_ERROR_CODE } })).toBe(true);
    expect(isReadOnlyErrorPayload({ error: { code: 'FORBIDDEN' } })).toBe(false);
  });
});

function req(method: string, path: string) {
  return new NextRequest(new URL(path, 'http://localhost:3014'), { method });
}

describe('readOnlyBlockedResponse', () => {
  it('does nothing when the database is writable', () => {
    delete process.env.DATABASE_READ_ONLY;
    expect(isDatabaseReadOnly()).toBe(false);
    expect(readOnlyBlockedResponse(req('POST', '/api/profiles/x/contact'))).toBeNull();
  });

  it('blocks mutating api calls and leaves reads alone', async () => {
    process.env.DATABASE_READ_ONLY = '1';
    expect(readOnlyBlockedResponse(req('GET', '/api/profiles/public'))).toBeNull();
    expect(readOnlyBlockedResponse(req('POST', '/api/auth/demo-login'))).toBeNull();
    expect(readOnlyBlockedResponse(req('POST', '/api/auth/logout'))).toBeNull();
    const blocked = readOnlyBlockedResponse(req('POST', '/api/profiles/x/contact'));
    expect(blocked?.status).toBe(403);
    expect(await blocked?.json()).toMatchObject({ error: { code: 'READ_ONLY' } });
    delete process.env.DATABASE_READ_ONLY;
  });
});
