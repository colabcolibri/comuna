'use strict';

const DEMO_MEMBER_COUNT = 40;

function loc(pt, en) {
  return [
    { locale: 'pt-BR', value: pt },
    { locale: 'en', value: en },
  ];
}

function place(pt, en, osmId, lat, lon, country) {
  return {
    provider: 'nominatim',
    osm_id: osmId,
    osm_type: 'relation',
    lat,
    lon,
    country_code: country,
    label: { 'pt-BR': pt, en },
  };
}

const SAO_PAULO = place('São Paulo', 'Sao Paulo', 298285, '-23.5505', '-46.6333', 'BR');
const RIO = place('Rio de Janeiro', 'Rio de Janeiro', 2697338, '-22.9068', '-43.1729', 'BR');
const RECIFE = place('Recife', 'Recife', 303388, '-8.0476', '-34.8770', 'BR');
const LISBOA = place('Lisboa', 'Lisbon', 5409179, '38.7223', '-9.1393', 'PT');
const BERLIM = place('Berlim', 'Berlin', 62422, '52.5200', '13.4050', 'DE');
const BARBACENA = place('Barbacena', 'Barbacena', 297522, '-21.2250', '-43.7736', 'BR');

const CITIES = [SAO_PAULO, RIO, RECIFE, LISBOA, BERLIM];
const AVAIL = ['available_for_hire', 'project_partner', 'mentor', 'unavailable'];
const GENDERS = ['woman', 'man', 'non_binary', 'prefer_not'];

const NAMED = [
  {
    n: 1,
    full_name: 'Marina Silva',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: BARBACENA,
    current_city: SAO_PAULO,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: {
      linkedin: 'https://linkedin.com/in/demo-marina',
      github: 'https://github.com/demo-marina',
      portfolio: 'https://example.com/marina',
    },
    headline: loc('Produto e comunidades', 'Product and communities'),
    bio: loc(
      'Desenha produtos para redes profissionais. Mentora de quem está a mudar de carreira.',
      'Designs products for professional networks. Mentors career switchers.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 2,
    full_name: 'João Almeida',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: RECIFE,
    current_city: RECIFE,
    languages: [{ code: 'pt', proficiency: 'native' }],
    contacts: { linkedin: 'https://linkedin.com/in/demo-joao' },
    headline: loc('Engenharia de dados', 'Data engineering'),
    bio: loc('Pipelines e qualidade de dados em operações de comunidade.', 'Data pipelines and quality for community ops.'),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 3,
    full_name: 'Alex Costa',
    gender: 'non_binary',
    preferred_locale: 'en',
    birth_city: SAO_PAULO,
    current_city: BERLIM,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
      { code: 'de', proficiency: 'basic' },
    ],
    contacts: { github: 'https://github.com/demo-alex', portfolio: 'https://example.com/alex' },
    headline: loc('Design de sistemas', 'Systems design'),
    bio: loc('Arquitetura calma. Menos feed, mais diretório.', 'Calm architecture. Less feed, more directory.'),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 4,
    full_name: 'Sofia Mendes',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: LISBOA,
    current_city: LISBOA,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
      { code: 'es', proficiency: 'advanced' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/demo-sofia' },
    headline: loc('Investigação e política pública', 'Research and public policy'),
    bio: loc('Liga universidades e prática. Não expõe e-mail na vitrine.', 'Bridges universities and practice. Email stays off the showcase.'),
    availability: 'unavailable',
    public_showcase: false,
    host_at_home: true,
  },
];

function padPerson(index) {
  const n = index + 1;
  const city = CITIES[index % CITIES.length];
  const shown = n % 5 !== 0;
  return {
    n,
    full_name: `Membro demo ${String(n).padStart(2, '0')}`,
    gender: GENDERS[index % GENDERS.length],
    preferred_locale: n % 3 === 0 ? 'en' : 'pt-BR',
    birth_city: BARBACENA,
    current_city: city,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }].slice(0, (index % 2) + 1),
    contacts:
      n % 4 === 0
        ? { linkedin: `https://linkedin.com/in/demo-member-${n}` }
        : {},
    headline: loc(`Headline ${n} · ${city.label['pt-BR']}`, `Headline ${n} · ${city.label.en}`),
    bio: loc(`Bio sintética ${n}. Cobre o catálogo de campos.`, `Synthetic bio ${n}. Covers the field catalog.`),
    availability: AVAIL[index % AVAIL.length],
    public_showcase: shown,
    host_at_home: n % 2 === 1,
  };
}

function demoPeople() {
  const people = [];
  for (let i = 0; i < DEMO_MEMBER_COUNT; i += 1) {
    const named = NAMED.find((item) => item.n === i + 1);
    people.push(named || padPerson(i));
  }
  return people;
}

function demoMemberEmails(count = DEMO_MEMBER_COUNT) {
  return Array.from({ length: count }, (_, i) => `member${String(i + 1).padStart(2, '0')}@demo.example`);
}

function emailFor(person) {
  return `member${String(person.n).padStart(2, '0')}@demo.example`;
}

module.exports = {
  DEMO_MEMBER_COUNT,
  demoMemberEmails,
  demoPeople,
  emailFor,
};
