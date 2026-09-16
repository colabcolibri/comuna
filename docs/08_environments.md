---
title: Environments and Setup
status: review
version: 1.11
updated: 2026-09-16
depends_on: [01_tech_stack.md, 05_architecture.md]
blocks: []
---

# 08 — Environments and setup

## Environment variables matrix

| Variable | Description | Required? | Example (synthetic) | Environment |
| -------- | ----------- | --------- | ------------------- | ----------- |
| `PORT` | Porta Next | Sim | `3014` | Local |
| `DATABASE_URL` | Postgres | Sim | `postgresql://postgres:postgres@localhost:5433/alumni_db` | All |
| `JWT_SECRET` | Assinatura JWT | Sim | sintético local | All |
| `INITIAL_SUPER_ADMIN_EMAIL` | Seed ops (não promove via login da vitrine) | Sim | `admin@example.com` | Local / Staging |
| `SMTP_HOST` | Host SMTP. Vazio = não envia | Sim local | `localhost` | All |
| `SMTP_PORT` | Porta SMTP | Sim local | `1026` (Mailpit publicado) | All |
| `SMTP_SECURE` | `none` \| `starttls` \| `tls`. Omisso: heurística da porta | Não | vazio no Mailpit | All |
| `SMTP_USER` | AUTH. Vazio no Mailpit | Não | — | Staging / prod |
| `SMTP_PASS` | Senha SMTP. Nunca no GET admin | Não | — | Staging / prod |
| `EMAIL_FROM_ADDRESS` | Fallback From se a plataforma ainda não tem `from_address` | Sim | `auth@community.local` | All |
| `NEXT_PUBLIC_APP_URL` | URL membro | Sim | `http://localhost:3014` | All |
| `NEXT_PUBLIC_OPS_URL` | URL ops (link na faixa da demo da web) | Não | `http://localhost:3015` | Demo / local |
| `MEDIA_ROOT` | Pasta local do ObjectStore | Não (default `storage`) | `storage` | Local |
| `MEDIA_DRIVER` | `local` ou `s3` | Não (default `local`) | `local` | All |
| `OPS_BASE_PATH` | Path ops se mesmo origin | Não | _(removido; ops é `apps/admin`)_ | — |
| `ALLOW_DEV_OTP` | Se `true`, loga OTP no server **nunca** no JSON de prod | Não | `true` só local | Local |
| `DATABASE_READ_ONLY` | Sessão da app em transação só de leitura (`SET default_transaction_read_only`). Writes (OTP, contacto, join) falham no Postgres | Não | `1` na demo pública | Demo |
| `PGSSL` | Força SSL do `pg` (`1`) ou desliga (`0`) | Não | `0` no Compose interno do VPS; `1` se o Postgres for gerido com SSL | Demo / staging / prod |

Busca de cidade: `GET /api/places/cities` chama Nominatim (OpenStreetMap). Sem chave. User-Agent próprio. Mínimo 1 req/s.

Mapa das listas (plugin `map`, default off): Leaflet 1.9 no cliente, tiles `tile.openstreetmap.org`. Sem token. `view=map` devolve até 5000 pins (foto/iniciais + clustering). Atribuição OSM no mapa. O container do mapa cria stacking context (`isolation` + `z-index: 0`): panes do Leaflet (400–1000) não competem com overlay Radix (dialog, sheet, select).

`INITIAL_ADMIN_EMAIL` legado: tratar como alias depreado de `INITIAL_SUPER_ADMIN_EMAIL`.

## Local development setup

### Pré-requisitos

- Node.js ^20
- pnpm 11
- Docker Desktop (Postgres + Mailpit)

### Infra

```bash
docker compose up -d
```

- Postgres: `localhost:5433` (`docker-compose.yml` mapeia 5433→5432)
- Mailpit UI: `http://localhost:8026` (SMTP `1026`)

### Apps (web + admin)

- `apps/web` é o Next de membros (`apps/web/src`). Não há `src/` na raiz.
- `apps/admin` é o Next de ops na porta 3015. Sessão: cookie `ops_token`.
- `pnpm install` **sempre na raiz**, workspace inteiro. `pnpm install --filter …` sozinho deixa as outras apps sem links. `pnpm dev` / `pnpm dev:admin` sobem cada app via launcher em `scripts/dev/`. Não rode `next` na raiz (isso cria `.next/` órfão).

`pnpm db:migrate` aplica SQL datado em `db/migrations/`. `pnpm db:migrate:status` lista arquivos applied versus pending. Sem Prisma, Drizzle ou Supabase.

```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:migrate:status
pnpm db:seed
pnpm dev
# outra aba:
pnpm dev:admin
```

Conferir o Postgres (porta publicada 5433):

```bash
psql "$DATABASE_URL"
# ou:
psql postgresql://postgres:postgres@localhost:5433/alumni_db
```

Cookie de sessão membro: `Secure` só quando `NODE_ENV=production`. Local HTTP usa `Secure=false` de propósito.

- Web (membros): `http://localhost:3014`
- Admin: `http://localhost:3015` (`apps/admin`) — login OTP + comunidades + pessoas da rede + módulos + coordenador. Cookie `ops_token`. Seed: `INITIAL_SUPER_ADMIN_EMAIL` (default `admin@example.com`).
- Reset de banco só em dev: `pnpm db:setup` (reset + migrate + seed). **Não** usar em produção.

## Seed do super-admin

Script de seed (US EPIC-11) insere `global_role = super_admin` para `INITIAL_SUPER_ADMIN_EMAIL`. O mesmo utilizador entra nas **seis** comunidades de demo como `coordinator` ativo — senão a web (`/directory`) responde vazio: a listagem exige membership, a vitrine não. Login ops **não** é “digitar o e-mail na tela Stitch e virar admin”.

Casas do seed local:

| slug | Nome | `type` | Vitrine pública | Extra de catálogo |
| ---- | ---- | ------ | --------------- | ----------------- |
| `demo` | Alumni Instituto Atlântico | `alumni` | sim | hospitalidade (`host_at_home`) |
| `cerrado-lab` | Incubadora Cerrado Lab | `incubator` | sim | estágio / pedido / setor |
| `pratica-dados` | Prática em dados públicos | `practice_community` | sim | domínio / ênfase / office hours |
| `mentoria-norte` | Rede de mentoria Amazônia-Norte | `mentor_network` | sim (vazia de propósito) | lado / tema / vaga |
| `conservatorio-litoral` | Alumni Conservatório do Litoral | `alumni` | sim | meio / ensina / circulação |
| `saude-territorio` | Prática em saúde e território | `practice_community` | sim | ocupação / SUS / território |

Trezentas pessoas (`member01@demo.example` … `member99@demo.example`, depois `member100` … `member300`). A mesma conta pode ter membership em mais de uma casa (cartão, turma e atributos por comunidade). As primeiras quarenta têm nomes e bios escritos à mão; o restante é gerado com ofício e cidade variados. Turmas (`cohorts`) entram no seed com código estável.

## Instância demo

A demo local é **o mesmo código** (`apps/web` e, à parte, `apps/admin`) com **o mesmo Postgres** (schema, RLS, seed). `DATABASE_READ_ONLY=1` no processo da app. Não há flag `DEMO`, snapshot JSON, SQLite no GitHub Pages nem overlay no browser. GitHub Pages não serve: é estático e não corre Route Handlers.

O visitante usa `/showcase` e `/c/{slug}/showcase` — já são públicos (`docs/architecture/showcase-public.md`). O diretório continua a exigir membership. Não publicar no README contas de ops, coordenação, `JWT_SECRET`, SMTP de produção nem `INITIAL_SUPER_ADMIN_EMAIL`.

Criar o projecto no host e colar secrets é **HAR**. Este runbook fecha a receita; o URL no ar é o humano.

### Local

Mesmo Postgres do `pnpm dev` (Docker + `.env` + migrate + seed). Só liga a sessão só de leitura no processo:

```bash
pnpm dev:demo
# outra aba, pasta diferente — pode correr ao mesmo tempo:
pnpm dev:admin:demo
```

**Uma instância por pasta.** O Next 16 não deixa dois `next dev` no mesmo `apps/web` (nem dois no mesmo `apps/admin`), mesmo em portas diferentes. Web e admin **podem** correr em paralelo: são pastas distintas (`3014` e `3015`). Se `pnpm dev` já está no 3014, pare esse terminal (Ctrl+C) e só então rode `pnpm dev:demo`. O mesmo para `pnpm dev:admin` vs `pnpm dev:admin:demo`.

`pnpm dev` + `pnpm dev:admin:demo` partilham o Postgres: a web ainda grava. Para os dois só de leitura, os dois scripts `:demo`.

Abre `http://localhost:3014/showcase` e `http://localhost:3015/login`. A faixa no topo e o diálogo nos writes só aparecem com `DATABASE_READ_ONLY=1` naquele processo. `pnpm dev` / `pnpm dev:admin` continuam a gravar.

**Login na demo (web):** `/login` mostra `member01@demo.example` e um botão **Entrar** (sem OTP). Essa conta tem membership em **três** comunidades (`demo`, `cerrado-lab`, `pratica-dados`) para o switcher. A rota `POST /api/auth/demo-login` responde **404** sem `DATABASE_READ_ONLY=1`. Com read-only: `SELECT` + JWT; só esse e-mail no allowlist.

**Login na demo (admin):** `/login` mostra a conta de seed ops (`admin@example.com`) e **Entrar** (sem OTP). `POST /api/admin/auth/demo-login` responde **404** sem `DATABASE_READ_ONLY=1`. Com read-only: `SELECT` + JWT `ops`; só essa conta, e só se for `super_admin`. OTP ops continua a falhar em read-only (grava token).

**Nunca** ligar `DATABASE_READ_ONLY` numa base com contas reais. Depois de mudar o seed, rode `pnpm db:seed` de novo. Avatares dos 300 membros: URLs diretas [DiceBear](https://www.dicebear.com/styles/sprouts/) estilo **sprouts** (ilustração colorida), gravadas só em `avatar_url` — sem ficheiro em `storage/`. Desligue com `SEED_DEMO_AVATARS=0`.

### Peças

1. **Hostinger VPS (KVM)** — Ubuntu 24.04. Template com Docker, ou CloudPanel. Não usar Web/Cloud/Business compartilhado: Postgres **não** existe nesses planos; o wizard de Node só oferece Supabase/Mongo Atlas, não o `pg` + RLS deste produto.
2. **Dois processos Node** no mesmo VPS: `@community/web` no host público e `@community/admin` num host `ops.` à parte.
3. **Postgres no próprio VPS**, rede interna (Compose). Porta `5432` **não** vai para a internet. `DATABASE_URL` usa o hostname do serviço (`postgres:5432`), não `localhost:5433`.
4. As **mesmas** variáveis da matriz. Demo: `SMTP_HOST` pode ficar vazio; `ALLOW_DEV_OTP` desligado; `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_OPS_URL` são os HTTPS reais **só no `.env.hostinger` do servidor**. `PGSSL=0` entre app e Postgres no Compose. Disco persistente para `MEDIA_ROOT` (ObjectStore local).
5. Migrate em cada deploy; seed **uma vez** (ou quando quiserem refrescar demo). Seed faz upsert; não é `db reset`. **Proibido** `pnpm db:setup` / `db:reset` no VPS.

Comprar o VPS, apontar DNS, colar secrets no servidor e o primeiro `up` são **HAR**.

### Hostinger VPS (caminho escolhido)

Pré-requisitos no painel (humano):

1. Plano **VPS**, não hospedagem de site. A Comuna entra como **projeto Compose à parte** (`name: comuna`) ao lado de outro Traefik em `network_mode: host`, se já existir. Não recriar o VPS. Não editar o Compose de outros projetos.
2. SSH por chave. Firewall: 22, 80, 443. Nada de 5432 na internet. Web/admin só em loopback.
3. DNS: `A` do host da vitrine e do host `ops.` para o IP do VPS. Valores reais **não** vão no git.

O MCP Hostinger `createNewProject` só cola um YAML e puxa **imagens**. Não constrói o monorepo. **Não** usar o painel Docker para substituir o projeto `traefik`. Deploy da Comuna: clone + `docker compose --build` no servidor.

```bash
# no servidor (não no laptop)
git clone git@github.com:…/alumni.git /opt/comuna
cd /opt/comuna
cp deploy/hostinger/env.example .env.hostinger
# editar POSTGRES_PASSWORD, JWT_SECRET, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_OPS_URL
# demo: DATABASE_READ_ONLY=1 no env da app (web e admin); seed sem essa flag
docker compose -f docker-compose.hostinger.yml --env-file .env.hostinger up -d --build
# uma vez, sem DATABASE_READ_ONLY no env da seed:
docker compose -f docker-compose.hostinger.yml --env-file .env.hostinger --profile seed run --rm seed
```

O `docker-compose.yml` da raiz (Postgres `5433` + Mailpit) é **só laptop**. No VPS usa-se `docker-compose.hostinger.yml`: Postgres interno, sem Mailpit, portas `127.0.0.1:3014` e `127.0.0.1:3015`.

TLS continua no Traefik que já está. Fundir `deploy/hostinger/traefik-file.yml` no file provider, alinhando `entryPoints` e `certResolver` com o `traefik.yml` da máquina. Upstream:

| Host | Loopback |
| ---- | -------- |
| vitrine (`NEXT_PUBLIC_APP_URL`) | `http://127.0.0.1:3014` |
| ops (`NEXT_PUBLIC_OPS_URL`) | `http://127.0.0.1:3015` |

`DATABASE_URL` **dentro** da rede `comuna_internal`: `postgresql://comuna:…@postgres:5432/alumni_db`. `PGSSL=0`. Healthcheck da web: `GET /api/health`. Backup: volume `comuna_pgdata` + `comuna_media`. Rollback: tag git anterior + `compose up -d --build`. Volumes **não** se apagam.

Demo no VPS: `DATABASE_READ_ONLY=1` só no processo da **app**. Migrate/seed usam `Client` sem essa flag. `proxy` responde `403 READ_ONLY` em writes de `/api/*`. Não ligar read-only numa base com contas reais.

Generate a strong `JWT_SECRET` no servidor. Não publicar e-mail de super-admin no README.

### O que não usar na Hostinger

| Oferta | Porquê não |
| ------ | ---------- |
| Web / Cloud / Business compartilhado | MySQL no painel; **sem Postgres**. Node “Web App” existe, mas o wizard de DB é Supabase/Mongo, não o driver `pg` + RLS daqui. Disco de media e dois Next do monorepo não cabem nesse fluxo. |
| Export estático / GitHub Pages | Route Handlers não correm. |
| Railway / Vercel | Recusado pelo manager. `railway.toml` / `nixpacks.toml` são legado; não são o runbook. |

Postgres gerido externo (Neon) + Node no painel Hostinger só faria sentido como atalho frágil. Não é o caminho: VPS com Postgres local.

### O que o visitante vê

Abrir `https://{vitrine}/showcase`. Com uma só comunidade pública no seed, a vitrine dessa casa; com várias, a lista para escolher. Sem login obrigatório. Em `/login`, **Entrar** com `member01@demo.example` para ver diretório e workspace — writes continuam bloqueados. Ops em `https://{ops}/login` com `admin@example.com`. Mensagem mediada só funciona se houver SMTP; senão o gesto falha como no produto sem mail.

### Fora deste caminho

SQLite/PGlite no repo, GitHub Pages, `isDemoMode`, dump JSON e “guardar pessoas no navegador” só na demo.

## CI

GitHub Actions alvo: `lint` + `pnpm test`. E2E Playwright quando a US de pipeline existir. Deploy prod é **HAR** (humano).
