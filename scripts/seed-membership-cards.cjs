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

function firstName(person) {
  return String(person.full_name || '').split(' ')[0] || 'Alguém';
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

function demoCopy(person) {
  const name = firstName(person);
  const city = cityPt(person);
  const cityE = cityEn(person);
  const templates = [
    () => ({
      headline: loc('Rede, ofício e o mapa da turma', 'The cohort map and a craft'),
      bio: loc(
        `${name} segue no Instituto Atlântico mesmo depois da formatura: indica gente, abre a agenda com parcimônia e ainda mora em ${city}. Não promete vaga; ajuda a achar quem já passou pelo mesmo aperto. Prefere conversa curta a grupo de WhatsApp eterno.`,
        `${name} stayed in the Instituto Atlântico orbit after graduation: points people to people, keeps a careful calendar, and still lives in ${cityE}. Does not promise a job; helps find someone who already hit the same snag. Prefers a short conversation to an endless chat group.`
      ),
    }),
    () => ({
      headline: loc('Ensino, técnica e o que a turma ainda deve', 'Teaching, craft, and what the cohort still owes'),
      bio: loc(
        `${name} usa a rede para não perder quem saiu da cidade. Em ${city}, combina mentoria com o trabalho do dia e recusa o tom de palco. Se a pergunta for sincera, responde; se for networking de evento, deixa quieto.`,
        `${name} uses the network so people who left town do not vanish. In ${cityE}, mixes mentoring with the day job and refuses conference-stage tone. Honest questions get an answer; event networking does not.`
      ),
    }),
    () => ({
      headline: loc('Quem constrói com a turma, não o feed', 'Building with the cohort, not a feed'),
      bio: loc(
        `${name} trata o diretório como lista de ofício. Vive em ${city} e ainda devolve conversa para quem está mudando de área. Bios longas de LinkedIn ficam fora; aqui cabe o que a pessoa realmente faz neste semestre.`,
        `${name} treats the directory as a craft list. Lives in ${cityE} and still talks with people switching fields. LinkedIn-length bios stay out; this house only needs what they actually do this term.`
      ),
    }),
  ];
  return pick(person.n, 0, templates)();
}

function cerradoCopy(person) {
  const name = firstName(person);
  const city = cityPt(person);
  const cityE = cityEn(person);
  const templates = [
    () => ({
      headline: loc('Negócio de território, não de palco', 'A territory venture, not a stage pitch'),
      bio: loc(
        `${name} incubou no Cerrado Lab um problema que ainda mora no interior, não só no deck. Opera a partir de ${city}: cliente, logística e o sócio que some no meio da safra. Busca gente que já tenha sujado a bota, não consultoria de corredor.`,
        `${name} incubated at Cerrado Lab a problem that still lives inland, not only on a deck. Operates from ${cityE}: customers, logistics, and the partner who vanishes mid-harvest. Looking for people who have already gotten their boots dirty, not hallway consulting.`
      ),
    }),
    () => ({
      headline: loc('Edição em curso, métrica no chão', 'Current edition, metrics on the ground'),
      bio: loc(
        `${name} está nesta edição para validar preço e canal, não para colecionar mentor. Base em ${city}. Conta o que já quebrou no campo e o que ainda é hipótese. Aberto a piloto chato, o tipo que paga pouco e ensina o processo.`,
        `${name} is in this edition to validate price and channel, not to collect mentors. Based in ${cityE}. Talks about what already broke in the field and what is still a hypothesis. Open to an unglamorous pilot — the kind that pays little and teaches the process.`
      ),
    }),
  ];
  return pick(person.n, 1, templates)();
}

function dadosCopy(person) {
  const name = firstName(person);
  const city = cityPt(person);
  const cityE = cityEn(person);
  const templates = [
    () => ({
      headline: loc('Número com procedência', 'A number with provenance'),
      bio: loc(
        `${name} trabalha dado público como ofício, não como dashboard de palco. Em ${city}, ainda abre o dicionário da base antes do gráfico. Oferece conversa para quem travou num join ou numa pauta, sem transformar a prática em curso pago.`,
        `${name} treats public data as a craft, not a stage dashboard. In ${cityE}, still opens the data dictionary before the chart. Offers a conversation to anyone stuck on a join or a story, without turning the practice into a paid course.`
      ),
    }),
    () => ({
      headline: loc('Base, ética e o fim de semana do CSV', 'Public data, ethics, and the CSV weekend'),
      bio: loc(
        `${name} cruza jornalismo, governo e produto sem fingir que são o mesmo trabalho. Mora em ${city}. Desconfia de indicador sem dono e de modelo que não diz o viés. A prática existe para o método sobreviver à ferramenta da moda.`,
        `${name} crosses journalism, government, and product without pretending they are the same job. Lives in ${cityE}. Distrusts an indicator with no owner and a model that will not name its bias. The practice exists so method outlives the fashionable tool.`
      ),
    }),
  ];
  return pick(person.n, 2, templates)();
}

function mentoriaCopy(person) {
  const name = firstName(person);
  const city = cityPt(person);
  const cityE = cityEn(person);
  const templates = [
    () => ({
      headline: loc('Orientação sem palco e sem captação', 'Mentorship without a stage or a funnel'),
      bio: loc(
        `${name} entra neste ciclo para conversar sobre trânsito, pesquisa ou serviço. Fala a partir de ${city}, com o Norte no centro da pergunta, não como pano de fundo. Fora da vitrine: o combinado chega pelo diretório da rede.`,
        `${name} is in this cycle to talk transition, research, or public service. Speaks from ${cityE}, with the North at the center of the question, not as scenery. Off the showcase: the arrangement arrives through the network directory.`
      ),
    }),
    () => ({
      headline: loc('Quem ficou, quem voltou, quem acompanha de longe', 'Who stayed, who returned, who follows from afar'),
      bio: loc(
        `${name} mentora ou é mentorada neste ciclo, às vezes os dois. Vive em ${city} e não trata a Amazônia como tema de evento. Agenda fecha; quando fecha, o campo de vaga some para ninguém ficar na fila invisível.`,
        `${name} mentors or is mentored this cycle, sometimes both. Lives in ${cityE} and does not treat the Amazon as a conference theme. Calendars close; when they do, the open-slot field turns off so nobody sits in an invisible queue.`
      ),
    }),
  ];
  return pick(person.n, 3, templates)();
}

function conservatorioCopy(person) {
  const name = firstName(person);
  const city = cityPt(person);
  const cityE = cityEn(person);
  const templates = [
    () => ({
      headline: loc('Ofício de palco e de sala', 'A craft for the stage and the room'),
      bio: loc(
        `${name} saiu do Conservatório do Litoral e ainda responde à turma: ensaio, indicação, aula. Vive em ${city}. O cartão diz o meio e se está em circulação este ano, sem virar release. Quem ensina marca; quem só quer temporada também.`,
        `${name} left the Conservatório do Litoral and still answers the cohort: rehearsal, a referral, a class. Lives in ${cityE}. The card names the medium and whether they are circulating this year, without becoming a press release. People who teach mark it; people who only want a season do too.`
      ),
    }),
    () => ({
      headline: loc('Formação, temporada e o recado da turma', 'Training, touring, and a note to the cohort'),
      bio: loc(
        `${name} usa esta rede para achar pianista, técnica de luz ou alguém que ainda dá aula no litoral. Base em ${city}. Evita o tom de vitrine de talento; prefere dizer o que está ensaiando e o que não cabe neste semestre.`,
        `${name} uses this network to find a pianist, a lighting tech, or someone who still teaches on the coast. Based in ${cityE}. Avoids talent-showcase tone; prefers to say what is in rehearsal and what does not fit this term.`
      ),
    }),
  ];
  return pick(person.n, 4, templates)();
}

function saudeCopy(person) {
  const name = firstName(person);
  const city = cityPt(person);
  const cityE = cityEn(person);
  const templates = [
    () => ({
      headline: loc('Cuidado no território, não só no consultório', 'Care on the territory, not only in clinic'),
      bio: loc(
        `${name} discute posto, deslocamento e o que o território faz com o protocolo. Atua a partir de ${city}. O cartão fala ocupação e SUS, não especialidade de vitrine. Serve para mutirão, residência e pesquisa de campo — conversa combinada, não plantão.`,
        `${name} talks about the clinic, the travel, and what territory does to the protocol. Works from ${cityE}. The card names occupation and the public system, not a showcase specialty. Useful for a collective effort, a residency, or field research — a scheduled conversation, not an on-call shift.`
      ),
    }),
    () => ({
      headline: loc('Rua, gestão e o protocolo que não cabe no papel', 'Street, management, and the protocol that will not fit on paper'),
      bio: loc(
        `${name} está nesta prática para cruzar gestão e chão. Vive em ${city}. Marca o tipo de território porque o cuidado muda entre periferia, rural, terra indígena e quilombo. Sem heroísmo: o ofício é o combinado com a equipe.`,
        `${name} is in this practice to cross management and the ground. Lives in ${cityE}. Marks the kind of territory because care changes across periphery, rural land, indigenous land, and quilombo. No heroics: the craft is the agreement with the team.`
      ),
    }),
  ];
  return pick(person.n, 5, templates)();
}

const COPY = {
  demo: demoCopy,
  'cerrado-lab': cerradoCopy,
  'pratica-dados': dadosCopy,
  'mentoria-norte': mentoriaCopy,
  'conservatorio-litoral': conservatorioCopy,
  'saude-territorio': saudeCopy,
};

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
  const copy = (COPY[slug] || demoCopy)(person);
  return {
    headline: copy.headline,
    bio: copy.bio,
    availability,
    public_showcase,
    attributes,
  };
}

module.exports = { membershipCard, attributesFor };
