import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { demoMemberEmails, DEMO_MEMBER_COUNT } = require('./db-seed.cjs');

describe('demo member seed list', () => {
  it('builds forty synthetic emails without drop or truncate', () => {
    const emails = demoMemberEmails();
    expect(DEMO_MEMBER_COUNT).toBe(40);
    expect(emails).toHaveLength(40);
    expect(new Set(emails).size).toBe(40);
    expect(emails[0]).toBe('member01@demo.example');
    expect(emails[39]).toBe('member40@demo.example');
  });
});
