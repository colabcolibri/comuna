---
title: Environments and Setup
status: review
version: 1.9
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
| `MEDIA_ROOT` | Pasta local do ObjectStore | Não (default `storage`) | `storage` | Local |
| `MEDIA_DRIVER` | `local` ou `s3` | Não (default `local`) | `local` | All |
| `OPS_BASE_PATH` | Path ops se mesmo origin | Não | _(removido; ops é `apps/admin`)_ | — |
| `ALLOW_DEV_OTP` | Se `true`, loga OTP no server **nunca** no JSON de prod | Não | `true` só local | Local |
| `DATABASE_READ_ONLY` | Sessão da app em transação só de leitura (`SET default_transaction_read_only`). Writes (OTP, contacto, join) falham no Postgres | Não | `1` na demo Railway | Demo |
| `PGSSL` | Força SSL do `pg` (`1`) ou desliga (`0`) | Não | vazio; Railway liga sozinho | Demo / staging |

Busca de cidade: `GET /api/places/cities` chama Nominatim (OpenStreetMap). Sem chave. User-Agent próprio. Mínimo 1 req/s.

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
- `pnpm install` **sempre na raiz**, workspace inteiro. `pnpm install --filter …` sozinho deixa as outras apps sem links. `pnpm dev` / `pnpm dev:admin` já filtram a app. Não rode `next` na raiz (isso cria `.next/` órfão).

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
- **Não** usar reset de banco.

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

A demo pública é **o mesmo app** (`apps/web`) com **o mesmo Postgres** (schema, RLS, seed). Não há flag `DEMO`, snapshot JSON, SQLite no GitHub Pages nem overlay no browser. GitHub Pages não serve: é estático e não corre Route Handlers.

O visitante usa `/showcase` e `/c/{slug}/showcase` — já são públicos (`docs/architecture/showcase-public.md`). O diretório continua a exigir membership. Não publicar no README contas de ops, coordenação, `JWT_SECRET`, SMTP de produção nem `INITIAL_SUPER_ADMIN_EMAIL`.

Criar o projecto no host e colar secrets é **HAR**. Este runbook fecha a receita; o URL no ar é o humano.

### Local

Mesmo Postgres do `pnpm dev` (Docker + `.env` + migrate + seed). Só liga a sessão só de leitura:

```bash
pnpm dev:demo
```

**Uma instância por vez.** O Next 16 não deixa dois `next dev` no mesmo `apps/web`, mesmo em portas diferentes. Se `pnpm dev` já está no 3014, pare esse terminal (Ctrl+C) e só então rode `pnpm dev:demo`. Não dá para ter os dois em paralelo.

Abre `http://localhost:3014/showcase`. A faixa no topo e o diálogo nos writes só aparecem com `DATABASE_READ_ONLY=1`. `pnpm dev` normal continua a gravar.

**Login na demo:** `/login` mostra `member01@demo.example` e um botão **Entrar** (sem OTP). Essa conta tem membership em **três** comunidades (`demo`, `cerrado-lab`, `pratica-dados`) para o switcher. A rota `POST /api/auth/demo-login` responde **404** sem `DATABASE_READ_ONLY=1`. Com read-only: `SELECT` + JWT; só esse e-mail no allowlist. **Nunca** ligar `DATABASE_READ_ONLY` numa base com contas reais. Depois de mudar o seed, rode `pnpm db:seed` de novo. Avatares dos 300 membros: URLs diretas [DiceBear](https://www.dicebear.com/styles/sprouts/) estilo **sprouts** (ilustração colorida), gravadas só em `avatar_url` — sem ficheiro em `storage/`. Desligue com `SEED_DEMO_AVATARS=0`.

### Peças

1. Postgres gerido (Neon, Railway Postgres, ou equivalente). SSL na `DATABASE_URL` como o fornecedor indicar.
2. Host Node para Next (Vercel, Railway, ou equivalente). Root do monorepo; app `@community/web`.
3. As **mesmas** variáveis da matriz acima. Na demo: `SMTP_HOST` pode ficar vazio (contacto falha como já falha sem mail; não se especializa a rota). `ALLOW_DEV_OTP` fica desligado. `NEXT_PUBLIC_APP_URL` é o domínio público da demo.
4. Na máquina com o repo (ou num job único de release), com `DATABASE_URL` apontado à base remota:

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
```

O seed faz upsert por e-mail/slug; não é `db reset`. Não o ponha em loop a cada cold start. Migrate em cada deploy; seed na primeira vez (ou quando quiserem refrescar o conteúdo de demonstração).

### Vercel (web)

- Root directory: repositório (não só `apps/web`, por causa dos workspace packages).
- Install: `pnpm install`
- Build: `pnpm --filter @community/web build`
- Output / app: `apps/web`
- Env: copiar a matriz; `DATABASE_URL` do Postgres gerido; `JWT_SECRET` só no painel, nunca no git.

Não é obrigatório publicar `apps/admin` neste URL. Ops fica fora da demo pública.

### Railway (web + Postgres)

1. Projecto novo: plugin **PostgreSQL** + serviço a partir deste repo (root do monorepo). `railway.toml` / `nixpacks.toml` já definem build Nixpacks, `pnpm start`, healthcheck em `/showcase` e `releaseCommand` = `pnpm db:migrate`.
2. Variáveis no serviço da **app** (além das que o plugin injeta): `JWT_SECRET`, `NEXT_PUBLIC_APP_URL` (URL pública Railway), `EMAIL_FROM_ADDRESS`, `DATABASE_READ_ONLY=1`. `SMTP_HOST` vazio. Não coloques `ALLOW_DEV_OTP`. `PORT` o Railway define.
3. `DATABASE_URL` vem do Postgres. SSL: o pool liga SSL quando `RAILWAY_ENVIRONMENT` existe. Migrate no release **não** usa `DATABASE_READ_ONLY` (script `Client` à parte) — o seed do catálogo e das pessoas continua a escrever.
4. Seed **uma vez**, na tua máquina ou num one-off **sem** `DATABASE_READ_ONLY` (ou o seed falha):

```bash
DATABASE_URL='postgresql://...railway...' pnpm db:seed
```

Na app, `DATABASE_READ_ONLY=1` impede INSERT/UPDATE/DELETE na sessão Node e o `proxy` responde `403 READ_ONLY` em qualquer `POST`/`PUT`/`PATCH`/`DELETE` de `/api/*` (uma porta; não há `if` por botão). A vitrine (SELECT) segue. Uma faixa no layout raiz avisa que é demonstração.

Generate a strong `JWT_SECRET`. Não publiques o e-mail do super-admin no README da demo.

### O que o visitante vê

Abrir `https://{domínio}/showcase`. Com uma só comunidade pública no seed, a vitrine dessa casa; com várias, a lista para escolher. Sem login obrigatório. Em `/login`, **Entrar** com `member01@demo.example` para ver diretório e workspace — writes continuam bloqueados. Mensagem mediada só funciona se houver SMTP; senão o gesto falha como no produto sem mail.

### Fora deste caminho

SQLite/PGlite no repo, GitHub Pages, `isDemoMode`, dump JSON e “guardar pessoas no navegador” só na demo.

## CI

GitHub Actions alvo: `lint` + `pnpm test`. E2E Playwright quando a US de pipeline existir. Deploy prod é **HAR** (humano).
