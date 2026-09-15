'use strict';

function loc(pt, en) {
  return [
    { locale: 'pt-BR', value: pt },
    { locale: 'en', value: en },
  ];
}

function pick(n, offset, list) {
  return list[(n + offset) % list.length];
}

function lastName(person) {
  const parts = String(person.full_name || '').trim().split(/\s+/);
  return parts[parts.length - 1] || 'Alguém';
}

function cityPt(person) {
  return person.current_city?.label?.['pt-BR'] || 'a cidade';
}

function cityEn(person) {
  return person.current_city?.label?.en || 'the city';
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

const HOUSE = {
  demo: {
    mul: 11,
    add: 0,
    adj: [
      ['Ofício calmo', 'Quiet craft'],
      ['Turma em trânsito', 'A cohort in transit'],
      ['Mapa da casa', 'A house map'],
      ['Rede sem palco', 'A network without a stage'],
      ['Pergunta sincera', 'An honest question'],
      ['Lista de gente', 'A people list'],
      ['Agenda curta', 'A short calendar'],
      ['Fora do feed', 'Off the feed'],
      ['Indicação com critério', 'A careful referral'],
      ['Trabalho de semestre', "This term's work"],
    ],
    craft: [
      ['produto de comunidade', 'community product'],
      ['dados em operação', 'data in operations'],
      ['arquitetura enxuta', 'lean architecture'],
      ['pesquisa aplicada', 'applied research'],
      ['contratos e risco', 'contracts and risk'],
      ['saúde digital', 'digital health'],
      ['backend estável', 'steady backend'],
      ['jornalismo de base', 'source journalism'],
      ['espaço e cidade', 'space and city'],
      ['orçamento público', 'public budget'],
      ['crédito e modelo', 'credit and models'],
      ['clima urbano', 'urban climate'],
      ['comunidade interna', 'internal community'],
      ['produção cultural', 'cultural production'],
      ['ensino médio', 'high-school teaching'],
      ['pesquisa com usuário', 'user research'],
      ['infraestrutura', 'infrastructure'],
      ['atenção primária', 'primary care'],
      ['finanças do terceiro setor', 'third-sector finance'],
      ['acolhimento', 'reception work'],
      ['música independente', 'independent music'],
      ['tecnologia na escola', 'school technology'],
      ['sistemas embarcados', 'embedded systems'],
      ['produto em fintech', 'fintech product'],
      ['tradução de não ficção', 'non-fiction translation'],
      ['cadeia curta de alimento', 'short food chain'],
      ['arquivo audiovisual', 'audiovisual archives'],
      ['desenvolvimento de gente', 'people development'],
      ['aprendizado de máquina', 'machine learning'],
      ['direito do trabalho', 'labor law'],
    ],
    does: [
      [
        'Indica gente com parcimônia e recusa vaga prometida no privado.',
        'Points people to people carefully and refuses a job promised in private.',
      ],
      [
        'Mantém a agenda curta: conversa combinada, sem grupo eterno.',
        'Keeps a short calendar: a scheduled talk, no endless chat group.',
      ],
      [
        'Usa o diretório para achar ofício, não para publicar conquista.',
        'Uses the directory to find a craft, not to post a win.',
      ],
      [
        'Devolve pergunta de quem mudou de cidade e perdeu a turma.',
        'Answers people who moved cities and lost the cohort.',
      ],
      [
        'Prefere uma linha honesta a um currículo colado.',
        'Prefers one honest line to a pasted CV.',
      ],
    ],
    beat: [
      ['fecha um piloto chato com quem já opera', 'closes an unglamorous pilot with someone already operating'],
      ['reescreve o onboarding da casa', 'rewrites onboarding for this house'],
      ['acompanha quem trocou de área depois dos 30', 'follows people who switched fields after 30'],
      ['abre a planilha de quem some no meio do projeto', 'opens the spreadsheet of people who vanish mid-project'],
      ['traduz a pauta da coordenação para quem acabou de entrar', 'translates coordination notes for people who just joined'],
    ],
  },
  'cerrado-lab': {
    mul: 17,
    add: 4,
    adj: [
      ['Negócio de chão', 'A ground-level venture'],
      ['Edição em curso', 'A running edition'],
      ['Preço no interior', 'Price inland'],
      ['Canal sem palco', 'A channel without a stage'],
      ['Safra e sócio', 'Harvest and a partner'],
      ['Piloto de território', 'A territory pilot'],
      ['Métrica suja', 'A dirty metric'],
      ['Cliente no campo', 'A field customer'],
      ['Logística real', 'Real logistics'],
      ['Hipótese no pátio', 'A hypothesis in the yard'],
    ],
    craft: [
      ['água e clima', 'water and climate'],
      ['alimento e cooperativa', 'food and cooperatives'],
      ['saúde no interior', 'inland health'],
      ['indústria leve', 'light industry'],
      ['educação técnica', 'technical education'],
      ['energia distribuída', 'distributed energy'],
      ['crédito rural', 'rural credit'],
      ['semente e estoque', 'seed and stock'],
      ['rastreio de carga', 'cargo tracking'],
      ['irrigação', 'irrigation'],
      ['bioinsumo', 'bio-inputs'],
      ['turismo de base', 'community tourism'],
      ['madeira legal', 'legal timber'],
      ['leite e frio', 'milk and cold chain'],
      ['software de pátio', 'yard software'],
      ['seguro agrícola', 'crop insurance'],
      ['máquina usada', 'used machinery'],
      ['feira e atacado', 'fairs and wholesale'],
      ['restauração de solo', 'soil restoration'],
      ['pesca continental', 'inland fishing'],
      ['apicultura', 'beekeeping'],
      ['habitação rural', 'rural housing'],
      ['conectividade', 'connectivity'],
      ['resíduos da agroindústria', 'agro-industry waste'],
      ['genética animal', 'animal genetics'],
      ['crédito para associação', 'association credit'],
      ['mapa de cliente', 'customer mapping'],
      ['preço de cooperativa', 'co-op pricing'],
      ['assistência técnica', 'extension work'],
      ['marca de território', 'a territory brand'],
    ],
    does: [
      [
        'Valida preço e canal com quem já sujou a bota, não com consultoria de corredor.',
        'Validates price and channel with people who already got their boots dirty, not hallway consulting.',
      ],
      [
        'Conta o que quebrou no campo e o que ainda é hipótese.',
        'Talks about what broke in the field and what is still a hypothesis.',
      ],
      ['Procura sócio que não suma no meio da safra.', 'Looks for a partner who will not vanish mid-harvest.'],
      [
        'Aceita piloto que paga pouco e ensina o processo.',
        'Takes a pilot that pays little and teaches the process.',
      ],
      [
        'Opera logística e cliente no mesmo dia, sem deck de palco.',
        'Runs logistics and customers on the same day, without a stage deck.',
      ],
    ],
    beat: [
      ['fecha tabela com a cooperativa da região', 'closes a table with the regional co-op'],
      ['mede perda na estrada, não só no pitch', 'measures loss on the road, not only on the pitch'],
      ['testa um SKU que o interior realmente compra', 'tests an SKU the interior actually buys'],
      ['negocia frio e prazo com quem já entrega', 'negotiates cold chain and terms with someone already delivering'],
      ['escreve o custo real do deslocamento', 'writes down the real cost of travel'],
    ],
  },
  'pratica-dados': {
    mul: 19,
    add: 8,
    adj: [
      ['Número com dono', 'A number with an owner'],
      ['Base antes do gráfico', 'The table before the chart'],
      ['Dicionário aberto', 'An open data dictionary'],
      ['Método contra moda', 'Method against fashion'],
      ['CSV no fim de semana', 'A weekend CSV'],
      ['Viés nomeado', 'Named bias'],
      ['Pauta com fonte', 'A story with a source'],
      ['Join que trava', 'A join that stalls'],
      ['Indicador sem palco', 'An indicator without a stage'],
      ['Ética na query', 'Ethics in the query'],
    ],
    craft: [
      ['analytics de serviço', 'service analytics'],
      ['aprendizado de máquina público', 'public-sector ML'],
      ['dado de governo', 'government data'],
      ['jornalismo de dados', 'data journalism'],
      ['produto analítico', 'analytics product'],
      ['SQL de produção', 'production SQL'],
      ['Python de pauta', 'Python for reporting'],
      ['visualização honesta', 'honest visualization'],
      ['dado geo', 'geodata'],
      ['censo e amostra', 'census and sample'],
      ['transparência ativa', 'active transparency'],
      ['orçamento aberto', 'open budget'],
      ['saúde e vigilância', 'health surveillance'],
      ['educação e IDEB', 'education metrics'],
      ['segurança pública', 'public safety data'],
      ['meio ambiente', 'environment data'],
      ['trabalho e renda', 'labor and income'],
      ['mobilidade urbana', 'urban mobility'],
      ['cadastro único', 'social registry'],
      ['licitação e contrato', 'procurement and contracts'],
      ['arquivo e OCR', 'archives and OCR'],
      ['API de estado', 'a government API'],
      ['qualidade de dado', 'data quality'],
      ['privacidade na base', 'privacy in the table'],
      ['modelo com recorte', 'a model with a cut'],
      ['painel que não mente', 'a dashboard that does not lie'],
      ['coleta de campo', 'field collection'],
      ['dicionário de variável', 'a variable dictionary'],
      ['série temporal curta', 'a short time series'],
      ['cruzamento de bases legais', 'a legal join of datasets'],
    ],
    does: [
      [
        'Abre o dicionário da base antes de desenhar o gráfico.',
        'Opens the data dictionary before drawing the chart.',
      ],
      [
        'Desconfia de indicador sem dono e de modelo que esconde o recorte.',
        'Distrusts an indicator with no owner and a model that hides its cut.',
      ],
      [
        'Cruza jornalismo, governo e produto sem fingir que são o mesmo ofício.',
        'Crosses journalism, government, and product without pretending they are the same craft.',
      ],
      [
        'Ajuda quem travou num join, sem transformar a prática em curso pago.',
        'Helps anyone stuck on a join, without turning the practice into a paid course.',
      ],
      [
        'Documenta o viés da coleta no mesmo lugar em que publica o número.',
        'Documents collection bias in the same place they publish the number.',
      ],
    ],
    beat: [
      ['fecha um dicionário de 40 variáveis', 'closes a dictionary of 40 variables'],
      ['reproduz um gráfico que a pauta já usou errado', 'reproduces a chart the newsroom already used wrong'],
      ['escreve a limitação da amostra em português claro', 'writes the sample limit in plain Portuguese'],
      ['abre office hours para um join emperrado', 'opens office hours for a stuck join'],
      ['publica o script junto com a tabela', 'publishes the script with the table'],
    ],
  },
  'mentoria-norte': {
    mul: 23,
    add: 11,
    adj: [
      ['Norte no centro', 'The North at the center'],
      ['Trânsito com método', 'A transition with method'],
      ['Pesquisa sem palco', 'Research without a stage'],
      ['Serviço e chão', 'Service and ground'],
      ['Quem ficou', 'Who stayed'],
      ['Quem voltou', 'Who returned'],
      ['Agenda que fecha', 'A calendar that closes'],
      ['Fila invisível, não', 'No invisible queue'],
      ['Amazônia sem tema', 'Amazon without a theme'],
      ['Combinado pelo diretório', 'Arranged through the directory'],
    ],
    craft: [
      ['carreira técnica', 'a technical career'],
      ['pesquisa de campo', 'field research'],
      ['serviço público', 'public service'],
      ['negócio na região', 'a regional venture'],
      ['saúde na calha', 'health along the river'],
      ['educação ribeirinha', 'riverside education'],
      ['comunicação local', 'local media'],
      ['direito territorial', 'territorial law'],
      ['logística fluvial', 'river logistics'],
      ['energia isolada', 'off-grid energy'],
      ['turismo de base', 'community tourism'],
      ['museu e memória', 'museum and memory'],
      ['agricultura familiar', 'family farming'],
      ['pesca e manejo', 'fishing and management'],
      ['habitação', 'housing'],
      ['saneamento', 'sanitation'],
      ['conectividade', 'connectivity'],
      ['formação docente', 'teacher training'],
      ['finanças solidárias', 'solidarity finance'],
      ['cultura e língua', 'culture and language'],
      ['vigilância em saúde', 'health surveillance'],
      ['gestão municipal', 'municipal management'],
      ['arquivo e história', 'archives and history'],
      ['software cívico', 'civic software'],
      ['cadeia de açaí', 'açaí chain'],
      ['cadeia de peixe', 'fish chain'],
      ['regularização fundiária', 'land regularization'],
      ['pesquisa climática', 'climate research'],
      ['residência médica', 'a medical residency'],
      ['extensão universitária', 'university extension'],
    ],
    does: [
      [
        'Conversa sobre trânsito, pesquisa ou serviço com o Norte no centro da pergunta.',
        'Talks transition, research, or service with the North at the center of the question.',
      ],
      ['Não trata a Amazônia como pano de fundo de evento.', 'Does not treat the Amazon as conference scenery.'],
      [
        'Fecha a agenda de propósito para ninguém ficar numa fila invisível.',
        'Closes the calendar on purpose so nobody sits in an invisible queue.',
      ],
      [
        'Mentora e às vezes pede mentoria no mesmo ciclo, com combinado explícito.',
        'Mentors and sometimes asks for mentorship in the same cycle, with an explicit arrangement.',
      ],
      [
        'Prefere o diretório da rede a qualquer captação de palco.',
        'Prefers the network directory to any stage funnel.',
      ],
    ],
    beat: [
      ['marca duas conversas e recusa a terceira', 'books two talks and refuses a third'],
      ['escreve o recado para quem voltou de residência', 'writes a note for someone back from a residency'],
      ['abre vaga só quando a semana tem buraco real', 'opens a slot only when the week has a real gap'],
      ['encaminha pesquisa de campo, não pauta de turismo', 'forwards field research, not a tourism brief'],
      ['acompanha um trânsito de carreira sem virar coach', 'follows a career transition without becoming a coach'],
    ],
  },
  'conservatorio-litoral': {
    mul: 29,
    add: 14,
    adj: [
      ['Ofício de sala', 'A room craft'],
      ['Temporada curta', 'A short season'],
      ['Ensaio, não release', 'Rehearsal, not a release'],
      ['Turma do litoral', 'The coastal cohort'],
      ['Palco e recado', 'Stage and a note'],
      ['Aula marcada', 'A booked class'],
      ['Luz e piano', 'Light and piano'],
      ['Circulação deste ano', "This year's circuit"],
      ['Formação contínua', 'Ongoing training'],
      ['Sem vitrine de talento', 'No talent showcase'],
    ],
    craft: [
      ['piano', 'piano'],
      ['regência', 'conducting'],
      ['canto', 'voice'],
      ['teatro de grupo', 'ensemble theatre'],
      ['dança contemporânea', 'contemporary dance'],
      ['ilustração de cena', 'stage illustration'],
      ['escrita dramática', 'playwriting'],
      ['luz de palco', 'stage lighting'],
      ['som ao vivo', 'live sound'],
      ['produção de temporada', 'season producing'],
      ['violoncelo', 'cello'],
      ['percussão', 'percussion'],
      ['composição', 'composition'],
      ['cenografia', 'set design'],
      ['figurino', 'costume'],
      ['dramaturgia', 'dramaturgy'],
      ['cinema de ensaio', 'essay film'],
      ['fotografia de cena', 'production stills'],
      ['pedagogia musical', 'music pedagogy'],
      ['corpo e voz', 'body and voice'],
      ['improvisação', 'improvisation'],
      ['ópera de bolso', 'chamber opera'],
      ['dança educativa', 'educational dance'],
      ['arquivo de partitura', 'score archives'],
      ['residência artística', 'an artist residency'],
      ['curadoria de mostra', 'festival curation'],
      ['crítica', 'criticism'],
      ['gestão de espaço', 'venue management'],
      ['luthieria', 'instrument making'],
      ['tradução de libreto', 'libretto translation'],
    ],
    does: [
      [
        'Responde ensaio, indicação e aula sem transformar o cartão em release.',
        'Answers rehearsal, referral, and class without turning the card into a press release.',
      ],
      [
        'Marca se ensina neste semestre e se está em circulação.',
        'Marks whether they teach this term and whether they are on the road.',
      ],
      [
        'Procura pianista, técnica de luz ou quem ainda dá aula no litoral.',
        'Looks for a pianist, a lighting tech, or someone who still teaches on the coast.',
      ],
      [
        'Diz o que está ensaiando e o que não cabe neste ano.',
        'Says what is in rehearsal and what does not fit this year.',
      ],
      ['Usa a rede da turma, não uma vitrine de talento.', 'Uses the cohort network, not a talent showcase.'],
    ],
    beat: [
      ['fecha um recitativo com pianista da casa', 'closes a recitative with the house pianist'],
      ['monta uma temporada de três noites, não um festival', 'puts together a three-night season, not a festival'],
      ['escreve o recado do elenco para quem chegou atrasado', 'writes the cast note for whoever arrived late'],
      ['abre aula livre numa sala emprestada', 'opens a free class in a borrowed room'],
      ['recusa um convite que só serve de palco', 'turns down an invite that only works as a stage'],
    ],
  },
  'saude-territorio': {
    mul: 31,
    add: 18,
    adj: [
      ['Cuidado no chão', 'Care on the ground'],
      ['Protocolo e rua', 'Protocol and street'],
      ['Posto e deslocamento', 'Clinic and travel'],
      ['Território que muda o caso', 'Territory that changes the case'],
      ['SUS sem vitrine', 'Public system, no showcase'],
      ['Equipe, não herói', 'A team, not a hero'],
      ['Mutirão combinado', 'A scheduled collective effort'],
      ['Residência de campo', 'A field residency'],
      ['Gestão e calçada', 'Management and the sidewalk'],
      ['Pesquisa sem plantão', 'Research, not an on-call shift'],
    ],
    craft: [
      ['enfermagem de território', 'territory nursing'],
      ['medicina de família', 'family medicine'],
      ['agente comunitário', 'community health work'],
      ['pesquisa de serviço', 'health-services research'],
      ['gestão de unidade', 'facility management'],
      ['vigilância', 'surveillance'],
      ['saúde mental', 'mental health'],
      ['saúde indígena', 'Indigenous health'],
      ['saúde quilombola', 'quilombola health'],
      ['saúde rural', 'rural health'],
      ['farmácia pública', 'public pharmacy'],
      ['fisioterapia na rua', 'street physiotherapy'],
      ['odonto no território', 'territory dentistry'],
      ['assistência social', 'social work'],
      ['regulação', 'regulation'],
      ['SAMU e deslocamento', 'emergency travel'],
      ['vacina e frio', 'vaccines and cold chain'],
      ['saúde da mulher', "women's health"],
      ['saúde do trabalhador', 'occupational health'],
      ['reabilitação', 'rehab'],
      ['cuidado paliativo', 'palliative care'],
      ['saúde escolar', 'school health'],
      ['nutrição no SUS', 'public nutrition'],
      ['laboratório', 'lab work'],
      ['informação em saúde', 'health information'],
      ['educação permanente', 'continuing education'],
      ['saúde do idoso', 'care for older adults'],
      ['saúde da criança', 'child health'],
      ['controle social', 'social control'],
      ['residência multiprofissional', 'a multiprofessional residency'],
    ],
    does: [
      [
        'Fala de posto, deslocamento e o que o território faz com o protocolo.',
        'Talks about the clinic, the travel, and what territory does to the protocol.',
      ],
      [
        'Marca ocupação e SUS, não especialidade de vitrine.',
        'Marks occupation and the public system, not a showcase specialty.',
      ],
      [
        'Serve mutirão, residência e pesquisa — conversa combinada, não plantão.',
        'Useful for a collective effort, a residency, or research — a scheduled talk, not an on-call shift.',
      ],
      ['Cruza gestão e chão sem heroísmo de equipe.', 'Crosses management and the ground without team heroics.'],
      [
        'Diz o tipo de território porque o cuidado muda entre periferia, rural, terra indígena e quilombo.',
        'Names the kind of territory because care changes across periphery, rural land, Indigenous land, and quilombo.',
      ],
    ],
    beat: [
      ['fecha a escala de um mutirão de sábado', 'closes the roster for a Saturday collective effort'],
      ['escreve o deslocamento real até o posto', 'writes down the real travel to the clinic'],
      ['abre conversa de residência, não de consultório particular', 'opens a residency conversation, not a private-practice pitch'],
      ['revisa protocolo que não cabe na casa da pessoa', 'revises a protocol that will not fit in someone’s home'],
      ['combina pesquisa de campo com a equipe do território', 'arranges field research with the territory team'],
    ],
  },
};

function takePair(list, index) {
  return list[index % list.length];
}

function headlineIndex(n, house) {
  const size = house.adj.length * house.craft.length;
  return ((n * house.mul + house.add) % size + size) % size;
}

function composedCopy(slug, person) {
  const house = HOUSE[slug] || HOUSE.demo;
  const i = headlineIndex(person.n, house);
  const adj = takePair(house.adj, i % house.adj.length);
  const craft = takePair(house.craft, Math.floor(i / house.adj.length) % house.craft.length);
  const does = takePair(house.does, (i + person.n) % house.does.length);
  const beat = takePair(house.beat, Math.floor(i / 3) % house.beat.length);
  const name = person.full_name;
  const city = cityPt(person);
  const cityE = cityEn(person);
  const who = lastName(person);
  return {
    headline: loc(`${adj[0]} · ${craft[0]}`, `${adj[1]} · ${craft[1]}`),
    bio: loc(
      `${name} vive em ${city}. ${does[0]} Neste semestre ${beat[0]}. O cartão da ${who} nesta casa é ofício, não slogan.`,
      `${name} lives in ${cityE}. ${does[1]} This term ${beat[1]}. ${who}'s card in this house is a craft, not a slogan.`
    ),
  };
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
  const copy = composedCopy(slug, person);
  return {
    headline: copy.headline,
    bio: copy.bio,
    availability,
    public_showcase,
    attributes,
  };
}

module.exports = { membershipCard, attributesFor, composedCopy };
