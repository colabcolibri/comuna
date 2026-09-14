---
title: Environments and Setup
status: draft
version: 1.3
updated: 2026-09-14
depends_on: [01_tech_stack.md, 05_architecture.md]
blocks: []
---

# 08 — Environments and setup

## Environment variables matrix

| Variable | Description | Required? | Example (synthetic) | Environment |
| -------- | ----------- | --------- | ------------------- | ----------- |
| `PORT` | Porta Next | Sim | `3014` | Local |
| `DATABASE_URL` | Postgres | Sim | `postgresql://postgres:postgres@localhost:5432/alumni_db` | All |
| `JWT_SECRET` | Assinatura JWT | Sim | sintético local | All |
| `INITIAL_SUPER_ADMIN_EMAIL` | Seed ops (não promove via login da vitrine) | Sim | `ops@alumni.local` | Local / Staging |
| `SMTP_HOST` | SMTP | Sim local | `localhost` | Local |
| `SMTP_PORT` | SMTP | Sim local | `1025` | Local |
| `EMAIL_FROM_ADDRESS` | From OTP | Sim | `auth@alumni.org` | All |
| `NEXT_PUBLIC_APP_URL` | URL membro | Sim | `http://localhost:3014` | All |
| `OPS_BASE_PATH` | Path ops se mesmo origin | Não | `/ops` | Local |
| `ALLOW_DEV_OTP` | Se `true`, loga OTP no server **nunca** no JSON de prod | Não | `true` só local | Local |

`INITIAL_ADMIN_EMAIL` legado: tratar como alias depreado de `INITIAL_SUPER_ADMIN_EMAIL`.

## Local development setup

### Pré-requisitos

- Node.js ^20
- Docker Desktop (Postgres + Mailpit)

### Infra

```bash
docker compose up -d
```

- Postgres: `localhost:5432`
- Mailpit UI: conferir `docker-compose.yml` (não misturar 8025 vs 8026 no código)

### App

```bash
cp .env.example .env
npm install
# aplicar migrações quando a US de db existir
npm run dev
```

- App: `http://localhost:3014`
- **Não** usar reset de banco.

## Seed do super-admin

Script de seed (US EPIC-11) insere `global_role = super_admin` para `INITIAL_SUPER_ADMIN_EMAIL`. Login ops **não** é “digitar o e-mail na tela Stitch e virar admin”.

## CI

GitHub Actions alvo: `lint` + `npm test`. E2E Playwright quando a US de pipeline existir. Deploy prod é **HAR** (humano).
