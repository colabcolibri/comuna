import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { demoMemberEmails, DEMO_MEMBER_COUNT, communitySlugsFor, SEED_COMMUNITIES } = require('./db-seed.cjs');
const { demoPeople, CORE_COUNT } = require('./seed-demo-people.cjs');
const { membershipCard } = require('./seed-membership-cards.cjs');

describe('demo member seed list', () => {
  it('attaches the ops seed user to every seeded community as coordinator', () => {
    const source = fs.readFileSync(path.join(import.meta.dirname, 'db-seed.cjs'), 'utf8');
    expect(source).toContain("'coordinator', 'active'");
    expect(source).toContain('SEED_COMMUNITIES');
    expect(SEED_COMMUNITIES[0].settings.showcase_title.length).toBeGreaterThan(8);
  });

  it('keeps six themed communities with distinct types, cohorts and extra fields', () => {
    expect(SEED_COMMUNITIES).toHaveLength(6);
    expect(new Set(SEED_COMMUNITIES.map((row) => row.slug)).size).toBe(6);
    expect(new Set(SEED_COMMUNITIES.map((row) => row.type)).size).toBe(4);
    expect(SEED_COMMUNITIES.every((row) => row.cohorts.length >= 3)).toBe(true);
    expect(SEED_COMMUNITIES.every((row) => row.extras[0].fields.length >= 1)).toBe(true);
    expect(SEED_COMMUNITIES.every((row) => row.settings.description.length > 80)).toBe(true);
    expect(SEED_COMMUNITIES.every((row) => row.settings.showcase_description.length > 80)).toBe(true);
    expect(SEED_COMMUNITIES.every((row) => row.settings.showcase_title.length <= 80)).toBe(true);
    expect(SEED_COMMUNITIES.every((row) => row.is_public_showcase === true)).toBe(true);
    expect(SEED_COMMUNITIES.find((row) => row.slug === 'demo')?.extras[0].fields[0].name).toBe('host_at_home');
  });

  it('builds three hundred synthetic emails without drop or truncate', () => {
    const emails = demoMemberEmails();
    expect(DEMO_MEMBER_COUNT).toBe(300);
    expect(emails).toHaveLength(300);
    expect(new Set(emails).size).toBe(300);
    expect(emails[0]).toBe('member01@demo.example');
    expect(emails[39]).toBe('member40@demo.example');
    expect(emails[98]).toBe('member99@demo.example');
    expect(emails[99]).toBe('member100@demo.example');
    expect(emails[299]).toBe('member300@demo.example');
  });

  it('covers identity, places, languages, contacts, card and showcase opt-in', () => {
    const people = demoPeople();
    expect(people).toHaveLength(300);
    expect(CORE_COUNT).toBe(40);
    const helena = people[0];
    expect(helena.full_name).toBe('Helena Prado');
    expect(helena.contacts.linkedin).toBe('https://example.com/linkedin/member01');
    expect(helena.contacts.github).toBe('https://example.com/github/member01');
    expect(helena.contacts.portfolio).toBe('https://example.com/portfolio/member01');
    const realHost = /linkedin\.com|github\.com|https:\/\/(?!example\.com\/)/;
    for (const person of people) {
      for (const href of Object.values(person.contacts || {})) {
        expect(String(href), person.full_name).toMatch(/^https:\/\/example\.com\//);
        expect(realHost.test(String(href)), String(href)).toBe(false);
      }
    }
    expect(helena.headline[0].locale).toBe('pt-BR');
    expect(helena.public_showcase).toBe(true);
    expect(people.some((person) => person.public_showcase === false)).toBe(true);
    expect(people.some((person) => person.availability === 'mentor')).toBe(true);
    expect(people.every((person) => !/^Membro demo/.test(person.full_name))).toBe(true);
    expect(new Set(people.map((person) => person.full_name)).size).toBe(300);
  });

  it('puts the demo login member in three communities for the switcher', () => {
    expect(communitySlugsFor(1)).toEqual(['demo', 'cerrado-lab', 'pratica-dados']);
  });

  it('puts some people in more than one community and leaves others in a single house', () => {
    const multi = [];
    const single = [];
    for (let n = 1; n <= 300; n += 1) {
      const slugs = communitySlugsFor(n);
      expect(slugs.length).toBeGreaterThan(0);
      if (slugs.length > 1) multi.push(n);
      else single.push(n);
    }
    expect(multi.length).toBeGreaterThan(30);
    expect(single.length).toBeGreaterThan(80);
    expect(new Set([...Array(300)].flatMap((_, i) => communitySlugsFor(i + 1))).size).toBe(6);
  });

  it('writes a longer card per membership, with tenant attributes', () => {
    const people = demoPeople();
    const helena = people[0];
    const demoCard = membershipCard('demo', helena);
    expect(demoCard.attributes.host_at_home).toBe(true);
    expect(demoCard.bio[0].value.length).toBeGreaterThan(80);
    const farmer = people.find((person) => person.n === 44);
    const labCard = membershipCard('cerrado-lab', farmer);
    expect(labCard.attributes.startup_stage).toBeTruthy();
    expect(labCard.bio[0].value.length).toBeGreaterThan(80);
    expect(labCard.headline[0].value.length).toBeGreaterThan(12);
    expect(labCard.headline[0].value).not.toBe(demoCard.headline[0].value);
    const mentor = people.find((person) => communitySlugsFor(person.n).includes('mentoria-norte'));
    expect(membershipCard('mentoria-norte', mentor).public_showcase).toBe(false);
  });

  it('gives every membership a real paragraph, never a two-word stub or a name', () => {
    const people = demoPeople();
    expect(people.every((person) => person.headline && person.bio[0].value.length > 80)).toBe(true);
    const stamp = /Quem procurar|Vive em |laboratório da prefeitura|ofício, não slogan/;
    for (const slug of SEED_COMMUNITIES.map((row) => row.slug)) {
      const members = people.filter((person) => communitySlugsFor(person.n).includes(slug));
      const cards = members.map((person) => membershipCard(slug, person));
      const bios = cards.map((card) => card.bio[0].value);
      expect(new Set(bios).size, slug).toBe(bios.length);
      for (let i = 0; i < members.length; i += 1) {
        const person = members[i];
        const headline = cards[i].headline[0].value;
        const bio = cards[i].bio[0].value;
        expect(bio.length, person.full_name).toBeGreaterThan(80);
        expect(headline.length, headline).toBeGreaterThan(12);
        expect(headline.includes(person.full_name)).toBe(false);
        expect(bio.includes(person.full_name)).toBe(false);
        expect(stamp.test(headline + bio)).toBe(false);
      }
    }
  });

  it('keeps hospitality off the platform catalog', () => {
    const catalog = fs.readFileSync(path.join(import.meta.dirname, 'seed-directory-catalog.cjs'), 'utf8');
    const seed = fs.readFileSync(path.join(import.meta.dirname, 'db-seed.cjs'), 'utf8');
    const tenants = fs.readFileSync(path.join(import.meta.dirname, 'seed-communities.cjs'), 'utf8');
    expect(seed).toContain('seedTenantExtras');
    const platform = catalog.slice(
      catalog.indexOf('function seedDirectoryCatalog'),
      catalog.indexOf('function seedDemoCatalogExtras')
    );
    expect(platform).not.toContain('hospitality');
    expect(platform).not.toContain('host_at_home');
    expect(catalog).toContain('plugin_directory.list_fields');
    expect(catalog).not.toMatch(/INSERT INTO plugin_directory\.fields \([^)]*filterable/);
    expect(catalog).toMatch(/name: 'full_name'/);
    expect(catalog).toMatch(/O nome que a rede usa para te achar/);
    expect((platform.match(/description: loc\('', ''\)/g) || []).length).toBe(0);
    expect(tenants).toContain("name: 'host_at_home'");
    expect(tenants).toContain('listFilterable');
    expect(tenants).not.toMatch(/name: 'host_at_home'[\s\S]{0,400}filterable: true/);
    expect(tenants).toContain('startup_stage');
    expect(tenants).toContain('mentorship_side');
    expect(tenants).toContain("name: 'medium'");
    expect(tenants).toContain('works_sus');
  });
});
