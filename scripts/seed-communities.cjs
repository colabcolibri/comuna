'use strict';

const { loc, opt, upsertCatalogGroups } = require('./seed-directory-catalog.cjs');

function settings(description, title, lede, locale = 'pt-BR') {
  if (description.length > 500) throw new Error(`description too long: ${description.length}`);
  if (title.length > 80) throw new Error(`showcase_title too long: ${title.length}`);
  if (lede.length > 500) throw new Error(`showcase_description too long: ${lede.length}`);
  return {
    description,
    showcase_title: title,
    showcase_description: lede,
    default_locale: locale,
  };
}

const SEED_COMMUNITIES = [
  {
    slug: 'demo',
    name: 'Alumni Instituto Atlântico',
    type: 'alumni',
    is_public_showcase: true,
    settings: settings(
      'Rede de egressos do Instituto Atlântico: formação técnica com passagem por empresa, escola pública, pesquisa e política. O diretório é o mapa da turma ao longo do tempo, não um feed. Hospitalidade (receber em casa) existe só nesta casa.',
      'Quem passou pelo Atlântico',
      'Quem estudou, ensinou ou construiu com o Instituto Atlântico e escolheu aparecer. Engenheiras, professoras, gente de oficina e de orçamento público. A vitrine é um recorte com consentimento, não um ranking de prestígio.'
    ),
    cohorts: [
      { name: 'Turma 2016', code: 'IA-2016' },
      { name: 'Turma 2019', code: 'IA-2019' },
      { name: 'Turma 2022', code: 'IA-2022' },
      { name: 'Turma 2025', code: 'IA-2025' },
    ],
    extras: [
      {
        slug: 'hospitality',
        label: loc('Hospitalidade', 'Hospitality'),
        description: loc(
          'Só esta comunidade pergunta se a pessoa topa receber visitas da rede. Não é campo da plataforma.',
          'Only this community asks whether someone will host visits from the network. Not a platform-wide field.'
        ),
        sort: 50,
        columns: 1,
        fields: [
          {
            name: 'host_at_home',
            type: 'boolean',
            label: loc('Topa receber pessoas na sua casa?', 'Would you host people at your home?'),
            description: loc(
              'Vale para quem passa na cidade, não para hospedagem comercial. Você controla o combinado depois, fora da plataforma.',
              'This is for people passing through town, not commercial lodging. You still arrange the visit outside the platform.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 10,
            module_slug: 'directory',
          },
        ],
      },
    ],
  },
  {
    slug: 'cerrado-lab',
    name: 'Incubadora Cerrado Lab',
    type: 'incubator',
    is_public_showcase: true,
    settings: settings(
      'Incubadora ligada ao bioma e à produção no Planalto Central. Edições anuais misturam agritech, clima, indústria de base e serviços para o interior. Coordenação acompanha estágio do negócio, não só o pitch.',
      'Quem está no Cerrado Lab',
      'Fundadoras, operadores e quem saiu da edição ainda carregando o problema do território. A vitrine mostra estágio, setor e o que a pessoa busca agora — sócio, cliente, capital ou gente para o time.'
    ),
    cohorts: [
      { name: 'Pré-incubação', code: 'CL-PRE' },
      { name: 'Edição 2023', code: 'CL-2023' },
      { name: 'Edição 2024', code: 'CL-2024' },
      { name: 'Edição 2025', code: 'CL-2025' },
    ],
    extras: [
      {
        slug: 'venture',
        label: loc('Negócio incubado', 'Incubated venture'),
        description: loc(
          'Estágio, setor e o pedido atual da pessoa na edição. Serve para filtrar o diretório da incubadora.',
          'Stage, sector, and what this person is asking for in the current edition. Used to filter the incubator directory.'
        ),
        sort: 50,
        columns: 2,
        fields: [
          {
            name: 'startup_stage',
            type: 'select',
            label: loc('Estágio do negócio', 'Venture stage'),
            description: loc(
              'Onde o negócio está de verdade, não o slide. Mude quando o produto ou a receita mudar.',
              'Where the venture actually is, not the slide. Update it when the product or revenue changes.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 10,
            module_slug: 'directory',
            options: [
              opt('idea', 'Ideia e validação', 'Idea and validation'),
              opt('mvp', 'MVP em campo', 'MVP in the field'),
              opt('traction', 'Tração e receita', 'Traction and revenue'),
              opt('scale', 'Escala', 'Scale'),
            ],
          },
          {
            name: 'looking_for',
            type: 'select',
            label: loc('O que busca agora', 'Looking for now'),
            description: loc(
              'Um pedido por vez. O diretório não é mural de captação permanente.',
              'One ask at a time. The directory is not a permanent fundraising wall.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 20,
            module_slug: 'directory',
            options: [
              opt('cofounder', 'Sócia ou sócio', 'A cofounder'),
              opt('capital', 'Capital', 'Capital'),
              opt('customers', 'Clientes-piloto', 'Pilot customers'),
              opt('talent', 'Pessoas para o time', 'People for the team'),
            ],
          },
          {
            name: 'sector',
            type: 'select',
            label: loc('Setor', 'Sector'),
            description: loc(
              'O problema que o negócio ataca, não o nome fantasia.',
              'The problem the venture attacks, not the brand name.'
            ),
            span: 2,
            storage: 'attributes',
            listFilterable: true,
            sort: 30,
            module_slug: 'directory',
            options: [
              opt('climate', 'Clima e água', 'Climate and water'),
              opt('agri', 'Agricultura e alimento', 'Agriculture and food'),
              opt('health', 'Saúde', 'Health'),
              opt('industry', 'Indústria e logística', 'Industry and logistics'),
              opt('education', 'Educação', 'Education'),
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pratica-dados',
    name: 'Prática em dados públicos',
    type: 'practice_community',
    is_public_showcase: true,
    settings: settings(
      'Comunidade de prática de quem cruza base pública, redação e serviço. Núcleos por cidade e um grupo remoto. O ponto não é ferramenta: é método, ética de dado pessoal e o hábito de perguntar de onde veio o número.',
      'Quem pratica dados em público',
      'Analistas, jornalistas e gente de governo que ainda abre CSV no fim de semana. A vitrine mostra domínio, ênfase técnica e se a pessoa oferece horário de conversa para a prática.'
    ),
    cohorts: [
      { name: 'Núcleo Recife', code: 'PD-REC' },
      { name: 'Núcleo Brasília', code: 'PD-BSB' },
      { name: 'Núcleo remoto', code: 'PD-REM' },
      { name: 'Grupo jornalismo', code: 'PD-JOR' },
    ],
    extras: [
      {
        slug: 'practice',
        label: loc('Na prática', 'In practice'),
        description: loc(
          'Como esta pessoa trabalha com dado público nesta comunidade — domínio, ênfase e se oferece conversa.',
          'How this person works with public data in this community — domain, emphasis, and whether they offer office hours.'
        ),
        sort: 50,
        columns: 2,
        fields: [
          {
            name: 'data_domain',
            type: 'select',
            label: loc('Domínio', 'Domain'),
            description: loc(
              'O tipo de problema que você mais pega, não o cargo.',
              'The kind of problem you take on most, not the job title.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 10,
            module_slug: 'directory',
            options: [
              opt('analytics', 'Análise e indicador', 'Analytics and indicators'),
              opt('ml', 'Aprendizado de máquina', 'Machine learning'),
              opt('gov', 'Dado em governo', 'Data in government'),
              opt('journalism', 'Jornalismo e apuração', 'Journalism and reporting'),
              opt('product', 'Produto e dado', 'Product and data'),
            ],
          },
          {
            name: 'stack_focus',
            type: 'select',
            label: loc('Ênfase técnica', 'Technical emphasis'),
            description: loc(
              'Por onde você entra no problema esta época. Pode mudar.',
              'Where you enter the problem this season. It can change.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 20,
            module_slug: 'directory',
            options: [
              opt('sql', 'SQL e warehouse', 'SQL and warehouse'),
              opt('python', 'Python e notebook', 'Python and notebooks'),
              opt('viz', 'Visualização', 'Visualization'),
              opt('geo', 'Dado geo', 'Geospatial data'),
            ],
          },
          {
            name: 'offers_office_hours',
            type: 'boolean',
            label: loc('Oferece horário de conversa', 'Offers office hours'),
            description: loc(
              'Uma hora combinada para quem está travado num join ou numa pauta. Não é plantão.',
              'A scheduled hour for someone stuck on a join or a story. Not an on-call shift.'
            ),
            span: 2,
            storage: 'attributes',
            listFilterable: true,
            sort: 30,
            module_slug: 'directory',
          },
        ],
      },
    ],
  },
  {
    slug: 'mentoria-norte',
    name: 'Rede de mentoria Amazônia-Norte',
    type: 'mentor_network',
    is_public_showcase: true,
    settings: settings(
      'Rede de mentoria entre quem ficou, quem voltou e quem trabalha o Norte à distância. A vitrine existe, mas neste seed ninguém optou: serve para ver o empty state. Ciclos anuais e um grupo âncora.',
      'Quem mentora no Norte',
      'Quem ficou, quem voltou e quem acompanha o Norte à distância. Nesta casa de demo a vitrine está aberta e vazia de propósito: ninguém deu o sim para aparecer em público.'
    ),
    cohorts: [
      { name: 'Âncoras', code: 'MN-ANC' },
      { name: 'Ciclo 2024', code: 'MN-2024' },
      { name: 'Ciclo 2025', code: 'MN-2025' },
    ],
    extras: [
      {
        slug: 'mentorship',
        label: loc('Mentoria neste ciclo', 'Mentorship this cycle'),
        description: loc(
          'Lado, tema e se a pessoa ainda tem vaga neste ciclo. Útil no diretório; na vitrine só entra quem optou.',
          'Side, topic, and whether this person still has a slot this cycle. Useful in the directory; the showcase only includes people who opted in.'
        ),
        sort: 50,
        columns: 2,
        fields: [
          {
            name: 'mentorship_side',
            type: 'select',
            label: loc('Neste ciclo você é', 'This cycle you are'),
            description: loc(
              'Pode ser os dois. O filtro do diretório usa esta escolha.',
              'You can be both. The directory filter uses this choice.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 10,
            module_slug: 'directory',
            options: [
              opt('mentor', 'Mentora ou mentor', 'Mentor'),
              opt('mentee', 'Mentorada ou mentorado', 'Mentee'),
              opt('both', 'Os dois', 'Both'),
            ],
          },
          {
            name: 'focus_area',
            type: 'select',
            label: loc('Tema', 'Focus'),
            description: loc(
              'O recorte em que você conversa com calma. Não precisa cobrir a Amazônia inteira.',
              'The slice you can talk through calmly. You do not need to cover the whole Amazon.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 20,
            module_slug: 'directory',
            options: [
              opt('career', 'Carreira e trânsito', 'Career and transition'),
              opt('research', 'Pesquisa', 'Research'),
              opt('venture', 'Negócio e território', 'Venture and territory'),
              opt('public', 'Serviço público', 'Public service'),
            ],
          },
          {
            name: 'open_slots',
            type: 'boolean',
            label: loc('Tem vaga neste ciclo', 'Has a slot this cycle'),
            description: loc(
              'Desmarque quando a agenda fechar. Evita fila invisível no grupo.',
              'Turn this off when your calendar is full. It avoids an invisible queue in the group.'
            ),
            span: 2,
            storage: 'attributes',
            listFilterable: true,
            sort: 30,
            module_slug: 'directory',
          },
        ],
      },
    ],
  },
  {
    slug: 'conservatorio-litoral',
    name: 'Alumni Conservatório do Litoral',
    type: 'alumni',
    is_public_showcase: true,
    settings: settings(
      'Egressos de música, teatro, dança, artes visuais e escrita do Conservatório do Litoral. Turmas por ano de formatura. O diretório mistura quem ensina, quem gira em temporada e quem saiu da cena e ainda responde à rede.',
      'Quem saiu do Conservatório',
      'Artistas, professoras e técnicas de palco que passaram pelo Conservatório do Litoral. A vitrine diz o meio, se a pessoa ensina e se está em circulação — sem transformar o cartão em release.'
    ),
    cohorts: [
      { name: 'Formatura 2016', code: 'CLIT-2016' },
      { name: 'Formatura 2019', code: 'CLIT-2019' },
      { name: 'Formatura 2022', code: 'CLIT-2022' },
      { name: 'Formatura 2025', code: 'CLIT-2025' },
    ],
    extras: [
      {
        slug: 'arts',
        label: loc('Ofício', 'Craft'),
        description: loc(
          'Meio artístico e se a pessoa ensina ou está em temporada. Campos desta casa, não do outro alumni.',
          'Artistic medium and whether this person teaches or is on tour. Fields for this house, not the other alumni network.'
        ),
        sort: 50,
        columns: 2,
        fields: [
          {
            name: 'medium',
            type: 'select',
            label: loc('Meio', 'Medium'),
            description: loc(
              'O ofício principal nesta rede. Se atua em dois, escolha o que as pessoas devem usar para te achar.',
              'The main craft in this network. If you work in two, pick the one people should use to find you.'
            ),
            span: 2,
            storage: 'attributes',
            listFilterable: true,
            sort: 10,
            module_slug: 'directory',
            options: [
              opt('music', 'Música', 'Music'),
              opt('theatre', 'Teatro', 'Theatre'),
              opt('dance', 'Dança', 'Dance'),
              opt('visual', 'Artes visuais', 'Visual arts'),
              opt('writing', 'Escrita e dramaturgia', 'Writing and dramaturgy'),
            ],
          },
          {
            name: 'teaches',
            type: 'boolean',
            label: loc('Ensina', 'Teaches'),
            description: loc(
              'Aula, orientação ou laboratório — mesmo informal. Ajuda quem busca formação, não contrato de temporada.',
              'Class, mentoring, or a lab — even informal. Helps people looking for training, not a touring contract.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 20,
            module_slug: 'directory',
          },
          {
            name: 'touring',
            type: 'boolean',
            label: loc('Em circulação neste ano', 'On tour this year'),
            description: loc(
              'Temporada, residência ou giro. Não é disponibilidade 24h.',
              'A season, a residency, or a tour. This is not 24-hour availability.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 30,
            module_slug: 'directory',
          },
        ],
      },
    ],
  },
  {
    slug: 'saude-territorio',
    name: 'Prática em saúde e território',
    type: 'practice_community',
    is_public_showcase: true,
    settings: settings(
      'Comunidade de prática de quem trabalha o cuidado no território: SUS, pesquisa, gestão e agente. O diretório prioriza ocupação e tipo de território, não especialidade de consultório. Útil para mutirão, residência e pesquisa de campo.',
      'Quem trabalha o território',
      'Profissionais de saúde, gestão e pesquisa que ainda discutem rua, posto e deslocamento. A vitrine mostra ocupação, se atua no SUS e o tipo de território — urbano, rural, indígena ou quilombola.'
    ),
    cohorts: [
      { name: 'Residência 2022', code: 'ST-RES22' },
      { name: 'Residência 2024', code: 'ST-RES24' },
      { name: 'Núcleo campo', code: 'ST-CAMPO' },
      { name: 'Núcleo gestão', code: 'ST-GES' },
    ],
    extras: [
      {
        slug: 'health',
        label: loc('No território', 'On the territory'),
        description: loc(
          'Ocupação, vínculo com o SUS e o tipo de território em que a pessoa mais atua nesta prática.',
          'Occupation, public-system link, and the kind of territory this person works most in this practice.'
        ),
        sort: 50,
        columns: 2,
        fields: [
          {
            name: 'occupation',
            type: 'select',
            label: loc('Ocupação', 'Occupation'),
            description: loc(
              'O papel com que você entra nesta prática, mesmo que o registro profissional seja outro.',
              'The role you bring into this practice, even if your professional registry says something else.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 10,
            module_slug: 'directory',
            options: [
              opt('nurse', 'Enfermagem', 'Nursing'),
              opt('physician', 'Medicina', 'Medicine'),
              opt('agent', 'Agente comunitária', 'Community health worker'),
              opt('researcher', 'Pesquisa', 'Research'),
              opt('manager', 'Gestão', 'Management'),
            ],
          },
          {
            name: 'works_sus',
            type: 'boolean',
            label: loc('Atua no SUS', 'Works in the public system'),
            description: loc(
              'Inclui vínculo, residência, consórcio ou apoio. Desmarque se o trabalho atual é só privado.',
              'Includes employment, residency, a consortium, or support work. Turn off if current work is private only.'
            ),
            span: 1,
            storage: 'attributes',
            listFilterable: true,
            sort: 20,
            module_slug: 'directory',
          },
          {
            name: 'territory',
            type: 'select',
            label: loc('Território', 'Territory'),
            description: loc(
              'O recorte em que você mais anda, não o endereço do CRM.',
              'The slice you walk most, not the address on your license.'
            ),
            span: 2,
            storage: 'attributes',
            listFilterable: true,
            sort: 30,
            module_slug: 'directory',
            options: [
              opt('urban', 'Urbano e periferia', 'Urban and periphery'),
              opt('rural', 'Rural', 'Rural'),
              opt('indigenous', 'Indígena', 'Indigenous'),
              opt('quilombola', 'Quilombola', 'Quilombola'),
            ],
          },
        ],
      },
    ],
  },
];

if (SEED_COMMUNITIES.length !== 6) {
  throw new Error(`expected 6 seed communities, got ${SEED_COMMUNITIES.length}`);
}

function communitySlugsFor(n) {
  const homes = [
    'demo',
    'cerrado-lab',
    'pratica-dados',
    'mentoria-norte',
    'conservatorio-litoral',
    'saude-territorio',
  ];
  const slugs = new Set();
  if (n <= 40) slugs.add('demo');
  else slugs.add(homes[(n - 1) % 6]);
  if (n % 11 === 0) slugs.add(homes[n % 6]);
  if (n % 13 === 0) slugs.add(homes[(n + 3) % 6]);
  return [...slugs];
}

function cohortFor(n, community) {
  if (n % 7 === 0) return null;
  return community.cohorts[n % community.cohorts.length];
}

async function seedTenantExtras(client, communityId, extras) {
  if (!extras?.length) return;
  await upsertCatalogGroups(client, communityId, extras);
}

module.exports = {
  SEED_COMMUNITIES,
  communitySlugsFor,
  cohortFor,
  seedTenantExtras,
};
