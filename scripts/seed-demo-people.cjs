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
const BH = place('Belo Horizonte', 'Belo Horizonte', 296651, '-19.9167', '-43.9345', 'BR');
const POA = place('Porto Alegre', 'Porto Alegre', 242470, '-30.0346', '-51.2177', 'BR');
const CURITIBA = place('Curitiba', 'Curitiba', 297515, '-25.4284', '-49.2733', 'BR');
const SALVADOR = place('Salvador', 'Salvador', 303201, '-12.9777', '-38.5016', 'BR');
const FORTALEZA = place('Fortaleza', 'Fortaleza', 302666, '-3.7172', '-38.5433', 'BR');
const BRASILIA = place('Brasília', 'Brasilia', 421151, '-15.7975', '-47.8919', 'BR');
const CAMPINAS = place('Campinas', 'Campinas', 298204, '-22.9056', '-47.0608', 'BR');
const BARBACENA = place('Barbacena', 'Barbacena', 297522, '-21.2250', '-43.7736', 'BR');
const LISBOA = place('Lisboa', 'Lisbon', 5409179, '38.7223', '-9.1393', 'PT');
const PORTO = place('Porto', 'Porto', 3459013, '41.1579', '-8.6291', 'PT');
const BERLIM = place('Berlim', 'Berlin', 62422, '52.5200', '13.4050', 'DE');
const PARIS = place('Paris', 'Paris', 7444, '48.8566', '2.3522', 'FR');
const AMSTERDA = place('Amsterdã', 'Amsterdam', 271110, '52.3676', '4.9041', 'NL');
const BARCELONA = place('Barcelona', 'Barcelona', 347950, '41.3874', '2.1686', 'ES');
const LONDRES = place('Londres', 'London', 65606, '51.5074', '-0.1278', 'GB');
const TORONTO = place('Toronto', 'Toronto', 324211, '43.6532', '-79.3832', 'CA');
const BUENOS_AIRES = place('Buenos Aires', 'Buenos Aires', 1224652, '-34.6037', '-58.3816', 'AR');

const PEOPLE = [
  {
    n: 1,
    full_name: 'Helena Prado',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: BARBACENA,
    current_city: SAO_PAULO,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: {
      linkedin: 'https://linkedin.com/in/helenaprado',
      github: 'https://github.com/helenaprado',
      portfolio: 'https://helenaprado.com',
    },
    headline: loc('Produto para redes profissionais', 'Product for professional networks'),
    bio: loc(
      'Desenha o caminho de quem entra numa comunidade e precisa achar gente, não feed. Mentora de quem está mudando de carreira depois dos 30.',
      'Designs the path for people who join a community to find people, not a feed. Mentors career switchers after 30.'
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
    contacts: { linkedin: 'https://linkedin.com/in/joaoalmeidarecife' },
    headline: loc('Engenharia de dados em operação', 'Data engineering in operations'),
    bio: loc(
      'Cuida de pipelines e qualidade de dados em organizações que ainda misturam planilha com sistema. Gosta de pergunta simples: de onde veio esse número?',
      'Owns pipelines and data quality in organizations that still mix spreadsheets with systems. Likes the simple question: where did this number come from?'
    ),
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
    contacts: { github: 'https://github.com/alexcsta', portfolio: 'https://alexcsta.dev' },
    headline: loc('Arquitetura de sistemas calmos', 'Calm systems architecture'),
    bio: loc(
      'Prefere diretório a timeline. Trabalha em serviços pequenos, contratos claros e menos estado escondido no cliente.',
      'Prefers a directory to a timeline. Works on small services, clear contracts, and less hidden state on the client.'
    ),
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
    contacts: { linkedin: 'https://linkedin.com/in/sofiamendeslx' },
    headline: loc('Investigação e política pública', 'Research and public policy'),
    bio: loc(
      'Liga universidade e prática em educação. Não coloca e-mail na vitrine: o contato passa pela coordenação da rede.',
      'Bridges university and practice in education. Email stays off the showcase: contact goes through the network coordinators.'
    ),
    availability: 'unavailable',
    public_showcase: false,
    host_at_home: true,
  },
  {
    n: 5,
    full_name: 'Rafael Nogueira',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: BH,
    current_city: BH,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'advanced' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/rafaelnogueira-bh' },
    headline: loc('Advogado de startups e contratos', 'Startup and contracts lawyer'),
    bio: loc(
      'Revisa contratos de sócios, investimento e prestadores. Explica o risco em português, não em latim de petição.',
      'Reviews shareholder, investment and contractor agreements. Explains risk in plain language, not petition Latin.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 6,
    full_name: 'Camila Ferreira',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: CURITIBA,
    current_city: CAMPINAS,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: {
      linkedin: 'https://linkedin.com/in/camilaferreira-prod',
      portfolio: 'https://camilaferreira.design',
    },
    headline: loc('Design de produto em saúde digital', 'Product design in digital health'),
    bio: loc(
      'Trabalha com fluxos para pacientes e clínicas. Obsessão atual: formulários que um adulto cansado consegue preencher no celular.',
      'Works on flows for patients and clinics. Current obsession: forms a tired adult can actually fill in on a phone.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 7,
    full_name: 'Thiago Barbosa',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: SALVADOR,
    current_city: RIO,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { github: 'https://github.com/tbarbosa', linkedin: 'https://linkedin.com/in/thiagobarbosa-eng' },
    headline: loc('Engenharia de software, backend', 'Software engineering, backend'),
    bio: loc(
      'APIs, filas e o tipo de incidente que só aparece na sexta. Mora no Rio e colabora remoto com times em São Paulo e Lisboa.',
      'APIs, queues, and the kind of incident that only shows up on Friday. Lives in Rio and works remotely with teams in Sao Paulo and Lisbon.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 8,
    full_name: 'Beatriz Lopes',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: POA,
    current_city: PORTO,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/beatrizlopes-porto' },
    headline: loc('Jornalismo de dados e investigação', 'Data journalism and investigations'),
    bio: loc(
      'Cruza bases públicas com reportagem. Saiu de Porto Alegre para o Porto e ainda cobre política brasileira à distância.',
      'Crosses public datasets with reporting. Left Porto Alegre for Porto and still covers Brazilian politics from afar.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 9,
    full_name: 'Diego Ramos',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: FORTALEZA,
    current_city: FORTALEZA,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'basic' }],
    contacts: {},
    headline: loc('Arquitetura e espaços comunitários', 'Architecture and community spaces'),
    bio: loc(
      'Projetos pequenos: biblioteca de bairro, sede de associação, reforma de escola. Prefere obra que a rua usa todo dia.',
      'Small projects: neighborhood library, association headquarters, school renovation. Prefers buildings the street uses every day.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 10,
    full_name: 'Lívia Castro',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: BRASILIA,
    current_city: BRASILIA,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
      { code: 'es', proficiency: 'basic' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/liviacastro-df' },
    headline: loc('Gestão pública e orçamento', 'Public management and budget'),
    bio: loc(
      'Passou por secretaria estadual e agora assessora conselhos. Não está na vitrine: pede conversa pela coordenação.',
      'Worked in a state secretariat and now advises councils. Off the public showcase: asks for contact through coordinators.'
    ),
    availability: 'unavailable',
    public_showcase: false,
    host_at_home: false,
  },
  {
    n: 11,
    full_name: 'Marcelo Vieira',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: SAO_PAULO,
    current_city: TORONTO,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
      { code: 'fr', proficiency: 'basic' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/marcelovieira-to', github: 'https://github.com/mvieira' },
    headline: loc('Ciência de dados em crédito', 'Data science in credit'),
    bio: loc(
      'Modelos de risco e o debate chato de viés. Mora em Toronto, volta a São Paulo no verão brasileiro.',
      'Risk models and the unglamorous bias debate. Lives in Toronto, back in Sao Paulo during the Brazilian summer.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 12,
    full_name: 'Ana Beatriz Souza',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: RECIFE,
    current_city: PARIS,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'fr', proficiency: 'fluent' },
      { code: 'en', proficiency: 'advanced' },
    ],
    contacts: { portfolio: 'https://anabeatrizsouza.fr', linkedin: 'https://linkedin.com/in/anabeatrizsouza' },
    headline: loc('Pesquisa em climatologia urbana', 'Urban climatology research'),
    bio: loc(
      'Estuda ilha de calor e verde nas cidades. Recife no currículo, Paris no laboratório. Abre a casa para quem passa em congresso.',
      'Studies urban heat islands and green cover. Recife on the CV, Paris in the lab. Hosts people passing through for conferences.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 13,
    full_name: 'Pedro Henrique Lima',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: CAMPINAS,
    current_city: SAO_PAULO,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }],
    contacts: { linkedin: 'https://linkedin.com/in/phlima-ops' },
    headline: loc('Operações e comunidades internas', 'Operations and internal communities'),
    bio: loc(
      'Organiza onboarding, ritos e o cadastro que ninguém quer manter. Se a planilha virou fonte da verdade, ele quer matar a planilha.',
      'Runs onboarding, rituals, and the registry nobody wants to maintain. If the spreadsheet became source of truth, he wants it gone.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 14,
    full_name: 'Isabela Duarte',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: RIO,
    current_city: BARCELONA,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'es', proficiency: 'fluent' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/isabeladuarte', portfolio: 'https://isabeladuarte.cat' },
    headline: loc('Produção cultural e residências', 'Cultural production and residencies'),
    bio: loc(
      'Programa residências e intercâmbio entre Brasil e Catalunha. Bom contato para quem chega em Barcelona sem rede.',
      'Programs residencies and exchange between Brazil and Catalonia. A good contact if you land in Barcelona without a network.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 15,
    full_name: 'Gabriel Teixeira',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: CURITIBA,
    current_city: CURITIBA,
    languages: [{ code: 'pt', proficiency: 'native' }],
    contacts: {},
    headline: loc('Professor de matemática no ensino médio', 'High-school mathematics teacher'),
    bio: loc(
      'Dá aula em escola pública e escreve material próprio. Fora da vitrine: prefere conversa discreta sobre vocação docente.',
      'Teaches in a public school and writes his own materials. Off the showcase: prefers a discreet conversation about teaching as a vocation.'
    ),
    availability: 'unavailable',
    public_showcase: false,
    host_at_home: false,
  },
  {
    n: 16,
    full_name: 'Fernanda Rocha',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: BH,
    current_city: LONDRES,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/fernandarocha-ux', github: 'https://github.com/ferocha' },
    headline: loc('Pesquisa com usuários e acessibilidade', 'User research and accessibility'),
    bio: loc(
      'Testa produto com gente de verdade, inclusive quem usa leitor de tela. Mora em Londres e ainda atende times no Brasil de manhã cedo.',
      'Tests products with real people, including screen-reader users. Lives in London and still joins Brazilian teams in the early morning.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 17,
    full_name: 'Lucas Martins',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: POA,
    current_city: AMSTERDA,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
      { code: 'nl', proficiency: 'basic' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/lucasmartins-ams', github: 'https://github.com/lmartins' },
    headline: loc('Infraestrutura e SRE', 'Infrastructure and SRE'),
    bio: loc(
      'Alertas, capacidade e o ritual de postmortem sem caça às bruxas. Holanda no visto, sotaque gaúcho no Zoom.',
      'Alerts, capacity, and blameless postmortems. Netherlands on the visa, gaucho accent on Zoom.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 18,
    full_name: 'Juliana Pires',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: SALVADOR,
    current_city: SALVADOR,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'advanced' }],
    contacts: { linkedin: 'https://linkedin.com/in/julianapires-saude' },
    headline: loc('Médica de família e comunidade', 'Family and community physician'),
    bio: loc(
      'Atende no SUS e discute território, não só diagnóstico. Mentora de quem está no internato e ainda não sabe se quer especializar.',
      'Works in the public system and talks territory, not only diagnosis. Mentors interns who still do not know if they want to specialize.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 19,
    full_name: 'André Carvalho',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: LISBOA,
    current_city: SAO_PAULO,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/andrecarvalho-fin' },
    headline: loc('Finanças para organizações sociais', 'Finance for social organizations'),
    bio: loc(
      'Nasceu em Lisboa, trabalha em São Paulo com OSCs que cresceram rápido demais para o Excel do tesoureiro.',
      'Born in Lisbon, works in Sao Paulo with social organizations that outgrew the treasurer spreadsheet.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 20,
    full_name: 'Renata Oliveira',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: BARBACENA,
    current_city: BH,
    languages: [{ code: 'pt', proficiency: 'native' }],
    contacts: {},
    headline: loc('Assistência social e acolhimento', 'Social work and reception services'),
    bio: loc(
      'Coordena acolhimento de famílias. Fora da vitrine pública por causa do trabalho de campo.',
      'Coordinates reception for families. Off the public showcase because of field work.'
    ),
    availability: 'unavailable',
    public_showcase: false,
    host_at_home: false,
  },
  {
    n: 21,
    full_name: 'Felipe Andrade',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: RIO,
    current_city: BUENOS_AIRES,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'es', proficiency: 'fluent' },
      { code: 'en', proficiency: 'advanced' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/felipeandrade-ba', portfolio: 'https://felipeandrade.ar' },
    headline: loc('Música e produção independente', 'Music and independent production'),
    bio: loc(
      'Produtor e músico. Ajuda artistas brasileiros a tocar em Buenos Aires sem cair em contrato ruim.',
      'Producer and musician. Helps Brazilian artists play in Buenos Aires without walking into a bad contract.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 22,
    full_name: 'Patrícia Gomes',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: FORTALEZA,
    current_city: RECIFE,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }],
    contacts: { linkedin: 'https://linkedin.com/in/patriciagomes-edu' },
    headline: loc('Tecnologia educacional', 'Education technology'),
    bio: loc(
      'Faz ferramenta de aula que professor de escola pública consegue usar com internet ruim. Recife é base, Ceará é origem.',
      'Builds classroom tools a public-school teacher can use on a bad connection. Recife is home base, Ceara is origin.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 23,
    full_name: 'Bruno Azevedo',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: CAMPINAS,
    current_city: CAMPINAS,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'advanced' }],
    contacts: { github: 'https://github.com/brunoazevedo', linkedin: 'https://linkedin.com/in/brunoazevedo-emb' },
    headline: loc('Hardware e sistemas embarcados', 'Hardware and embedded systems'),
    bio: loc(
      'Firmware, sensores e o momento em que o protótipo funciona na bancada e falha no campo. Aberto a parceria de laboratório.',
      'Firmware, sensors, and the moment a prototype works on the bench and fails in the field. Open to lab partnerships.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 24,
    full_name: 'Carolina Dias',
    gender: 'woman',
    preferred_locale: 'en',
    birth_city: SAO_PAULO,
    current_city: LONDRES,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/carolinadias-pm' },
    headline: loc('Gestão de produto em fintech', 'Product management in fintech'),
    bio: loc(
      'Já lançou conta, cartão e o fluxo de disputa que ninguém quer desenhar. Mentora de PMs júnior que herdaram backlog inflado.',
      'Has shipped accounts, cards, and the dispute flow nobody wants to design. Mentors junior PMs who inherited an inflated backlog.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 25,
    full_name: 'Eduardo Nunes',
    gender: 'prefer_not',
    preferred_locale: 'pt-BR',
    birth_city: PORTO,
    current_city: LISBOA,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }],
    contacts: {},
    headline: loc('Tradução e edição de não ficção', 'Translation and non-fiction editing'),
    bio: loc(
      'Traduz ensaio e relatório técnico. Fora da vitrine: aceita encomenda pela coordenação da comunidade.',
      'Translates essays and technical reports. Off the showcase: takes commissions through community coordinators.'
    ),
    availability: 'unavailable',
    public_showcase: false,
    host_at_home: true,
  },
  {
    n: 26,
    full_name: 'Mariana Freitas',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: BH,
    current_city: PARIS,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'fr', proficiency: 'fluent' },
      { code: 'en', proficiency: 'advanced' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/marianafreitas-gastro', portfolio: 'https://marianafreitas.kitchen' },
    headline: loc('Gastronomia e cadeias curtas', 'Gastronomy and short supply chains'),
    bio: loc(
      'Cozinha com produtores pequenos. Em Paris, ainda importa farinha e história de Minas. Recebe quem visita a cidade com fome e pergunta boa.',
      'Cooks with small producers. In Paris, still imports flour and stories from Minas. Hosts visitors who arrive hungry and with a good question.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 27,
    full_name: 'Ricardo Melo',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: RECIFE,
    current_city: RIO,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }],
    contacts: { linkedin: 'https://linkedin.com/in/ricardomelo-cine' },
    headline: loc('Documentário e arquivo audiovisual', 'Documentary and audiovisual archives'),
    bio: loc(
      'Faz filme longo e cataloga acervo familiar que ia para o lixo. Parceria com quem tem fita, não só ideia.',
      'Makes feature documentaries and catalogs family archives that were heading to the trash. Partners with people who have tape, not only an idea.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 28,
    full_name: 'Tatiane Ribeiro',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: CURITIBA,
    current_city: POA,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'basic' }],
    contacts: { linkedin: 'https://linkedin.com/in/tatianeribeiro-rh' },
    headline: loc('Pessoas e desenvolvimento de liderança', 'People and leadership development'),
    bio: loc(
      'Coaching de liderança sem jargão de palestra. Trabalha com times técnicos que foram promovidos sem mapa.',
      'Leadership coaching without keynote jargon. Works with technical teams who got promoted without a map.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 29,
    full_name: 'Henrique Sousa',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: BRASILIA,
    current_city: BERLIM,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'de', proficiency: 'advanced' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { github: 'https://github.com/hsousa', linkedin: 'https://linkedin.com/in/henriquesousa-ml' },
    headline: loc('Aprendizado de máquina aplicado', 'Applied machine learning'),
    bio: loc(
      'Modelos em produção, não notebook de demo. Berlim de base; ainda vota e discute política brasileira de longe.',
      'Models in production, not demo notebooks. Berlin as base; still votes and argues Brazilian politics from afar.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 30,
    full_name: 'Amanda Correia',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: SAO_PAULO,
    current_city: SAO_PAULO,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }, { code: 'it', proficiency: 'basic' }],
    contacts: {},
    headline: loc('Direito trabalhista e sindicatos', 'Labor law and unions'),
    bio: loc(
      'Atende trabalhador e entidade. Fora da vitrine: o escritório já tem fila; o diretório é para a rede, não para captação.',
      'Represents workers and unions. Off the showcase: the office already has a queue; the directory is for the network, not lead gen.'
    ),
    availability: 'unavailable',
    public_showcase: false,
    host_at_home: false,
  },
  {
    n: 31,
    full_name: 'Vinícius Pacheco',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: RIO,
    current_city: SAO_PAULO,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }],
    contacts: { linkedin: 'https://linkedin.com/in/viniciuspacheco', github: 'https://github.com/vpacheco' },
    headline: loc('Mobile e performance em app', 'Mobile and app performance'),
    bio: loc(
      'iOS e Android quando o app trava na abertura. Gosta de medir frame, não de slide de “experiência fluida”.',
      'iOS and Android when the app freezes on launch. Likes measuring frames, not slides about a fluid experience.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 32,
    full_name: 'Natália Campos',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: SALVADOR,
    current_city: LISBOA,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/nataliacampos-mig' },
    headline: loc('Migração e regularização em Portugal', 'Migration and regularization in Portugal'),
    bio: loc(
      'Acompanha quem chega de Brasil e PALOP. Explica SEF, NIF e o que o grupo de WhatsApp erra. Recebe quem acabou de aterrissar.',
      'Supports people arriving from Brazil and PALOP countries. Explains residency, tax ID, and what WhatsApp groups get wrong. Hosts people who just landed.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 33,
    full_name: 'Otávio Brandão',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: BH,
    current_city: FORTALEZA,
    languages: [{ code: 'pt', proficiency: 'native' }],
    contacts: { portfolio: 'https://otaviobrandao.photo' },
    headline: loc('Fotografia de território e arquivo', 'Territory photography and archives'),
    bio: loc(
      'Fotografa rua, obra e arquivo familiar. Aberto a ensaio em Fortaleza e interior do Ceará.',
      'Photographs streets, construction sites, and family archives. Open to assignments in Fortaleza and inland Ceara.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 34,
    full_name: 'Simone Araújo',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: RECIFE,
    current_city: AMSTERDA,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
      { code: 'nl', proficiency: 'advanced' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/simonearaujo-energy' },
    headline: loc('Energia e transição elétrica', 'Energy and power transition'),
    bio: loc(
      'Trabalha com rede e renovável. Holanda no emprego, Nordeste na pergunta: quem paga a conta da transição.',
      'Works on grids and renewables. Netherlands on the job, Northeast Brazil in the question: who pays for the transition.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 35,
    full_name: 'Igor Santana',
    gender: 'non_binary',
    preferred_locale: 'pt-BR',
    birth_city: SAO_PAULO,
    current_city: SAO_PAULO,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }, { code: 'es', proficiency: 'basic' }],
    contacts: { github: 'https://github.com/igorsantana', portfolio: 'https://igorsantana.work' },
    headline: loc('Ilustração e design editorial', 'Illustration and editorial design'),
    bio: loc(
      'Capa, infográfico e identidade para revistas pequenas. Parceria com quem tem texto e prazo, não moodboard infinito.',
      'Covers, infographics, and identity for small magazines. Partners with people who have copy and a deadline, not an endless moodboard.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 36,
    full_name: 'Daniela Moura',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: CAMPINAS,
    current_city: TORONTO,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/danielamoura-bio' },
    headline: loc('Biotecnologia e regulação sanitária', 'Biotech and health regulation'),
    bio: loc(
      'Dossiê para agência e o intervalo entre laboratório e prateleira. Mentora de quem está saindo da pós para a indústria.',
      'Agency dossiers and the gap between lab and shelf. Mentors people leaving grad school for industry.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: false,
  },
  {
    n: 37,
    full_name: 'Caio Fonseca',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: POA,
    current_city: CURITIBA,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'advanced' }],
    contacts: { linkedin: 'https://linkedin.com/in/caiofonseca-agro' },
    headline: loc('Agronomia e cooperativas', 'Agronomy and cooperatives'),
    bio: loc(
      'Assistência técnica em cooperativa. Fala de solo e de governança com a mesma paciência.',
      'Technical assistance in a cooperative. Talks soil and governance with the same patience.'
    ),
    availability: 'project_partner',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 38,
    full_name: 'Larissa Pinto',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: RIO,
    current_city: RIO,
    languages: [{ code: 'pt', proficiency: 'native' }, { code: 'en', proficiency: 'fluent' }],
    contacts: { linkedin: 'https://linkedin.com/in/larissapinto-psic' },
    headline: loc('Psicologia clínica e trabalho', 'Clinical and workplace psychology'),
    bio: loc(
      'Atende adulto e discute burnout sem virar post. Fora da vitrine: agenda fechada; o diretório é só para a turma.',
      'Sees adults and talks burnout without turning it into a post. Off the showcase: books are full; the directory is for the cohort only.'
    ),
    availability: 'unavailable',
    public_showcase: false,
    host_at_home: false,
  },
  {
    n: 39,
    full_name: 'Gustavo Correia',
    gender: 'man',
    preferred_locale: 'pt-BR',
    birth_city: FORTALEZA,
    current_city: BARCELONA,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'es', proficiency: 'fluent' },
      { code: 'en', proficiency: 'advanced' },
    ],
    contacts: { github: 'https://github.com/gcorreia', linkedin: 'https://linkedin.com/in/gustavocorreia-geo' },
    headline: loc('Geografia urbana e mobilidade', 'Urban geography and mobility'),
    bio: loc(
      'Estuda ônibus, bicicleta e o mapa que a prefeitura não atualiza. Bom para quem chega a Barcelona e quer entender o bairro, não só o Sagrada.',
      'Studies buses, bikes, and the map the city never updates. Useful if you land in Barcelona and want the neighborhood, not only the Sagrada.'
    ),
    availability: 'available_for_hire',
    public_showcase: true,
    host_at_home: true,
  },
  {
    n: 40,
    full_name: 'Elisa Monteiro',
    gender: 'woman',
    preferred_locale: 'pt-BR',
    birth_city: LISBOA,
    current_city: PORTO,
    languages: [
      { code: 'pt', proficiency: 'native' },
      { code: 'en', proficiency: 'fluent' },
      { code: 'fr', proficiency: 'basic' },
    ],
    contacts: { linkedin: 'https://linkedin.com/in/elisamonteiro-hist' },
    headline: loc('História pública e museus', 'Public history and museums'),
    bio: loc(
      'Mediação em museu e texto para exposição. Abre a casa no Porto para quem pesquisa arquivo ou só precisa de um jantar depois do arquivo.',
      'Museum mediation and exhibition copy. Hosts in Porto anyone researching archives, or anyone who just needs dinner after the archives.'
    ),
    availability: 'mentor',
    public_showcase: true,
    host_at_home: true,
  },
];

if (PEOPLE.length !== DEMO_MEMBER_COUNT) {
  throw new Error(`demo people must be ${DEMO_MEMBER_COUNT}, got ${PEOPLE.length}`);
}

function demoPeople() {
  return PEOPLE;
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
