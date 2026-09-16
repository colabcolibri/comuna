'use strict';

const { homeSlug } = require('./communities.cjs');
const DEMO = require('../profiles/demo-home.cjs');
const CERRADO = require('../profiles/cerrado-home.cjs');
const DADOS = require('../profiles/dados-home.cjs');
const NORTE = require('../profiles/norte-home.cjs');
const CONSERV = require('../profiles/conserv-home.cjs');
const SAUDE = require('../profiles/saude-home.cjs');
const GUEST = require('../profiles/guest.cjs');

function loc(pt, en) {
  return [
    { locale: 'pt-BR', value: pt },
    { locale: 'en', value: en },
  ];
}

function asCopy(row) {
  if (!row) return null;
  return { headline: loc(row[0], row[1]), bio: loc(row[2], row[3]) };
}

const HOME_ROWS = {
  demo: DEMO,
  'cerrado-lab': CERRADO,
  'pratica-dados': DADOS,
  'mentoria-norte': NORTE,
  'conservatorio-litoral': CONSERV,
  'saude-territorio': SAUDE,
};

function homeIndex(n) {
  if (n <= 40) return n - 1;
  const r = (n - 1) % 6;
  const first = 41 + ((r - 4 + 6) % 6);
  return (n - first) / 6;
}

function homeCopy(n) {
  if (n <= 40) return null;
  const slug = homeSlug(n);
  const rows = HOME_ROWS[slug];
  const idx = homeIndex(n);
  const row = rows[idx];
  if (!row) {
    throw new Error(`missing home profile ${slug} index ${idx} n=${n}`);
  }
  return asCopy(row);
}

function composedCopy(slug, person) {
  const n = person.n;
  if (slug === homeSlug(n)) {
    if (n <= 40 && person.headline && person.bio) {
      return { headline: person.headline, bio: person.bio };
    }
    const copy = n <= 40 ? null : homeCopy(n);
    if (copy) return copy;
  }
  const guest = asCopy(GUEST[`${n}:${slug}`]);
  if (guest) return guest;
  throw new Error(`missing profile copy n=${n} slug=${slug}`);
}

module.exports = { composedCopy, homeCopy, homeIndex, homeSlug };
