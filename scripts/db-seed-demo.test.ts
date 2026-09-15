import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { demoMemberEmails, DEMO_MEMBER_COUNT } = require('./db-seed.cjs');
const { demoPeople } = require('./seed-demo-people.cjs');

describe('demo member seed list', () => {
  it('attaches the ops seed user to the demo community so directory has a membership', () => {
    const source = fs.readFileSync(path.join(import.meta.dirname, 'db-seed.cjs'), 'utf8');
    expect(source).toContain("'coordinator', 'active'");
  });

  it('attaches the ops seed user to the demo community so directory has a membership', () => {
    const source = fs.readFileSync(path.join(import.meta.dirname, 'db-seed.cjs'), 'utf8');
    expect(source).toMatch(/network_role, network_status/);
    expect(source).toContain("'coordinator', 'active'");
  });

  it('builds forty synthetic emails without drop or truncate', () => {
    const emails = demoMemberEmails();
    expect(DEMO_MEMBER_COUNT).toBe(40);
    expect(emails).toHaveLength(40);
    expect(new Set(emails).size).toBe(40);
    expect(emails[0]).toBe('member01@demo.example');
    expect(emails[39]).toBe('member40@demo.example');
  });

  it('covers identity, places, languages, contacts, card and showcase opt-in', () => {
    const people = demoPeople();
    expect(people).toHaveLength(40);
    const marina = people[0];
    expect(marina.full_name).toBe('Marina Silva');
    expect(marina.contacts.linkedin).toMatch(/^https:\/\//);
    expect(marina.headline[0].locale).toBe('pt-BR');
    expect(marina.public_showcase).toBe(true);
    expect(people.some((person) => person.public_showcase === false)).toBe(true);
    expect(people.some((person) => person.availability === 'mentor')).toBe(true);
  });
});
