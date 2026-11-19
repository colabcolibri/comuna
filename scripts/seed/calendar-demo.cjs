'use strict';

function atOffsetDays(daysOffset, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const DEMO_EVENTS = [
  {
    title: 'Roda de Boas-Vindas & Apresentação do Mural',
    description:
      'Encontro online para quem acabou de chegar na comunidade conhecer a plataforma, tirar dúvidas sobre o perfil e se conectar com outras pessoas da rede.',
    daysOffset: 2,
    startHour: 19,
    durationHours: 1.5,
    format: 'online',
    location: '',
    meetingUrl: 'https://meet.google.com/gsa-boas-vindas',
  },
  {
    title: 'Café Presencial em São Paulo — Trocas & Projetos',
    description:
      'Encontro informal para tomar um café, contar em que projetos estamos trabalhando e descobrir colaborações locais.',
    daysOffset: 5,
    startHour: 10,
    durationHours: 2,
    format: 'in_person',
    location: 'Vila Madalena, São Paulo - SP',
    meetingUrl: null,
  },
  {
    title: 'Oficina Aberta: Mapeamento de Talentos e Parcerias',
    description:
      'Sessão prática para estruturar ofertas no Mural de Talentos e conectar demandas reais entre turmas.',
    daysOffset: 9,
    startHour: 18,
    durationHours: 1.5,
    format: 'hybrid',
    location: 'Espaço Elos, Santos - SP',
    meetingUrl: 'https://meet.google.com/gsa-oficina-talentos',
  },
  {
    title: 'Mutirão de Bioconstrução — Fim de Semana',
    description:
      'Dia inteiro de mão na massa com troca de saberes em permacultura, manejo de solo e construção coletiva.',
    daysOffset: 14,
    startHour: 9,
    durationHours: 6,
    format: 'in_person',
    location: 'Zona Sul, São Paulo - SP',
    meetingUrl: null,
  },
  {
    title: 'Encontro Mensal da Rede — Retrospectiva e Próximos Passos',
    description:
      'Espaço aberto de escuta, celebração das iniciativas do mês e alinhamento da agenda do próximo ciclo.',
    daysOffset: 21,
    startHour: 19,
    durationHours: 1.5,
    format: 'online',
    location: '',
    meetingUrl: 'https://meet.google.com/gsa-encontro-mensal',
  },
  {
    title: 'Roda de Abertura do Ciclo',
    description:
      'Encontro de abertura com apresentação dos novos grupos de trabalho e metas compartilhadas.',
    daysOffset: -5,
    startHour: 19,
    durationHours: 1.5,
    format: 'online',
    location: '',
    meetingUrl: 'https://meet.google.com/gsa-abertura',
  },
];

async function seedDemoCalendar(client, tenants, memberIds) {
  const demo = tenants.demo;
  if (!demo) {
    return 0;
  }

  const membershipRes = await client.query(
    `SELECT id, user_id FROM network_core.memberships
     WHERE community_id = $1 AND network_status = 'active'
     ORDER BY joined_at ASC`,
    [demo.id]
  );
  const memberships = membershipRes.rows;
  if (!memberships.length) {
    return 0;
  }

  const preferredCreatorIds = [];
  for (const n of [1, 2, 3, 4, 5]) {
    const uid = memberIds.get(n);
    const found = memberships.find((m) => m.user_id === uid);
    if (found) preferredCreatorIds.push(found.id);
  }
  const creators = preferredCreatorIds.length ? preferredCreatorIds : [memberships[0].id];

  let eventCount = 0;
  for (let i = 0; i < DEMO_EVENTS.length; i += 1) {
    const spec = DEMO_EVENTS[i];
    const starts = atOffsetDays(spec.daysOffset, spec.startHour, 0);
    const ends = new Date(starts.getTime() + spec.durationHours * 60 * 60 * 1000);
    const creatorId = creators[i % creators.length];

    const existing = await client.query(
      `SELECT id FROM plugin_calendar.events WHERE community_id = $1 AND title = $2`,
      [demo.id, spec.title]
    );

    let eventId;
    if (existing.rows[0]) {
      eventId = existing.rows[0].id;
      await client.query(
        `UPDATE plugin_calendar.events
         SET description = $2, starts_at = $3, ends_at = $4, format = $5, location = $6, meeting_url = $7, updated_at = now()
         WHERE id = $1`,
        [eventId, spec.description, starts.toISOString(), ends.toISOString(), spec.format, spec.location, spec.meetingUrl]
      );
    } else {
      const inserted = await client.query(
        `INSERT INTO plugin_calendar.events
           (community_id, creator_membership_id, title, description, starts_at, ends_at, format, location, meeting_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          demo.id,
          creatorId,
          spec.title,
          spec.description,
          starts.toISOString(),
          ends.toISOString(),
          spec.format,
          spec.location,
          spec.meetingUrl,
        ]
      );
      eventId = inserted.rows[0].id;
    }

    const rsvpSlice = memberships.slice(0, Math.min(memberships.length, 8));
    for (let j = 0; j < rsvpSlice.length; j += 1) {
      const status = (i + j) % 3 === 0 ? 'interested' : 'going';
      await client.query(
        `INSERT INTO plugin_calendar.rsvps (event_id, membership_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (event_id, membership_id) DO UPDATE SET status = EXCLUDED.status`,
        [eventId, rsvpSlice[j].id, status]
      );
    }
    eventCount += 1;
  }

  return eventCount;
}

module.exports = { seedDemoCalendar };
