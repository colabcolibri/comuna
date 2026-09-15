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
    expect(source).toContain('showcase_title');
    expect(source).toContain('Pessoas da rede');
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
    const helena = people[0];
    expect(helena.full_name).toBe('Helena Prado');
    expect(helena.contacts.linkedin).toMatch(/^https:\/\//);
    expect(helena.headline[0].locale).toBe('pt-BR');
    expect(helena.public_showcase).toBe(true);
    expect(people.some((person) => person.public_showcase === false)).toBe(true);
    expect(people.some((person) => person.availability === 'mentor')).toBe(true);
    expect(people.every((person) => !/^Membro demo/.test(person.full_name))).toBe(true);
    expect(people.every((person) => !person.headline[0].value.startsWith('Headline '))).toBe(true);
    expect(people.every((person) => !person.bio[0].value.startsWith('Bio sintética'))).toBe(true);
    expect(new Set(people.map((person) => person.full_name)).size).toBe(40);
  });

  it('keeps hospitality off the platform catalog', () => {
    const catalog = fs.readFileSync(path.join(import.meta.dirname, 'seed-directory-catalog.cjs'), 'utf8');
    const seed = fs.readFileSync(path.join(import.meta.dirname, 'db-seed.cjs'), 'utf8');
    expect(seed).toContain('seedDemoCatalogExtras');
    const platform = catalog.slice(
      catalog.indexOf('function seedDirectoryCatalog'),
      catalog.indexOf('function seedDemoCatalogExtras')
    );
    expect(platform).not.toContain('hospitality');
    expect(platform).not.toContain('host_at_home');
    expect(catalog).toContain('function seedDemoCatalogExtras');
    expect(catalog).toMatch(/name: 'full_name'[\s\S]{0,240}description: loc\('[^']+/);
    expect((catalog.match(/description: loc\('', ''\)/g) || []).length).toBe(6);
  });
});
