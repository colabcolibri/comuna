---
title: Environments and Setup
status: review
version: 1.4
updated: 2026-09-15
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
| `SMTP_HOST` | SMTP | Sim local | `localhost` | Local |
| `SMTP_PORT` | SMTP | Sim local | `1025` | Local |
| `EMAIL_FROM_ADDRESS` | From OTP | Sim | `auth@alumni.org` | All |
| `NEXT_PUBLIC_APP_URL` | URL membro | Sim | `http://localhost:3014` | All |
| `MEDIA_ROOT` | Pasta local do ObjectStore | Não (default `storage`) | `storage` | Local |
| `MEDIA_DRIVER` | `local` ou `s3` | Não (default `local`) | `local` | All |
| `OPS_BASE_PATH` | Path ops se mesmo origin | Não | _(removido; ops é `apps/admin`)_ | — |
| `ALLOW_DEV_OTP` | Se `true`, loga OTP no server **nunca** no JSON de prod | Não | `true` só local | Local |

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
- `apps/admin` é o Next de ops na porta 3015, sem AppNavbar Stitch. Sessão: cookie `ops_token`.

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

Script de seed (US EPIC-11) insere `global_role = super_admin` para `INITIAL_SUPER_ADMIN_EMAIL`. O mesmo utilizador entra na comunidade `demo` como `coordinator` ativo — senão a web (`/directory`) responde vazio: a listagem exige membership, a vitrine não. Login ops **não** é “digitar o e-mail na tela Stitch e virar admin”. Membros sintéticos: `member01@demo.example` … `member40@demo.example`.

## CI

GitHub Actions alvo: `lint` + `pnpm test`. E2E Playwright quando a US de pipeline existir. Deploy prod é **HAR** (humano).
