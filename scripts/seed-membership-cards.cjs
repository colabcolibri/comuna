'use strict';

const { composedCopy } = require('./seed-profile-corpus.cjs');

function pick(n, offset, list) {
  return list[(n + offset) % list.length];
}

function attributesFor(slug, n, person) {
  if (slug === 'demo') {
    return { host_at_home: person.host_at_home != null ? Boolean(person.host_at_home) : n % 3 === 0 };
  }
  if (slug === 'cerrado-lab') {
    return {
      startup_stage: pick(n, 0, ['idea', 'mvp', 'traction', 'scale']),
      looking_for: pick(n, 1, ['cofounder', 'capital', 'customers', 'talent']),
      sector: pick(n, 2, ['climate', 'agri', 'health', 'industry', 'education']),
    };
  }
  if (slug === 'pratica-dados') {
    return {
      data_domain: pick(n, 0, ['analytics', 'ml', 'gov', 'journalism', 'product']),
      stack_focus: pick(n, 1, ['sql', 'python', 'viz', 'geo']),
      offers_office_hours: n % 2 === 0,
    };
  }
  if (slug === 'mentoria-norte') {
    return {
      mentorship_side: pick(n, 0, ['mentor', 'mentee', 'both']),
      focus_area: pick(n, 1, ['career', 'research', 'venture', 'public']),
      open_slots: n % 3 !== 0,
    };
  }
  if (slug === 'conservatorio-litoral') {
    return {
      medium: pick(n, 0, ['music', 'theatre', 'dance', 'visual', 'writing']),
      teaches: n % 2 === 0,
      touring: n % 4 === 0,
    };
  }
  if (slug === 'saude-territorio') {
    return {
      occupation: pick(n, 0, ['nurse', 'physician', 'agent', 'researcher', 'manager']),
      works_sus: n % 5 !== 0,
      territory: pick(n, 1, ['urban', 'rural', 'indigenous', 'quilombola']),
    };
  }
  return {};
}

function membershipCard(slug, person) {
  const n = person.n;
  const availability = ['available_for_hire', 'project_partner', 'mentor', 'unavailable'][n % 4];
  const public_showcase = slug === 'mentoria-norte' ? false : n % 6 !== 0;
  const attributes = attributesFor(slug, n, person);
  if (slug === 'demo' && person.headline && person.bio) {
    return {
      headline: person.headline,
      bio: person.bio,
      availability: person.availability,
      public_showcase: person.public_showcase,
      attributes,
    };
  }
  const copy = composedCopy(slug, person, attributes);
  return {
    headline: copy.headline,
    bio: copy.bio,
    availability,
    public_showcase,
    attributes,
  };
}

module.exports = { membershipCard, attributesFor, composedCopy };
