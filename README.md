# Comuna

Plataforma web de comunidades: pessoas, tenants e um diretório — sem feed, sem chat, sem “rede social”. Alumni, turma, prática ou incubadora são tipos de comunidade, não o produto.

Duas apps Next no mesmo Postgres: **web** (membros, visitantes, coordenadores) e **admin** (super-admin). Plugins ligam ou desligam por comunidade.

## Arranque rápido

Precisa de Node.js 20+, [pnpm](https://pnpm.io) 11 e Docker Desktop.

```bash
docker compose up -d
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Noutra aba:

```bash
pnpm dev:admin
```

| Superfície | URL |
| ---------- | --- |
| Membros | [http://localhost:3014](http://localhost:3014) |
| Ops | [http://localhost:3015](http://localhost:3015) |
| Mailpit (OTP local) | [http://localhost:8026](http://localhost:8026) |
| Postgres | `localhost:5433` (`alumni_db`) |

Entrada ops: o e-mail em `INITIAL_SUPER_ADMIN_EMAIL` (seed). OTP cai no Mailpit, não no JSON da API.

## O que faz

- Comunidade = tenant com membros, papéis e coordenação de entrada
- Perfil-base da pessoa (identidade); campos extras só com o plugin de diretório
- Vitrine pública e contato mediado, se o módulo estiver ligado naquele tenant
- Catálogo de campos no admin (grupos, obrigatoriedade, layout do perfil)
- i18n `pt-BR` (padrão) e `en`
- OTP por e-mail (SMTP; Mailpit no local)

Não entra nesta versão: chat, fórum, feed, pagamentos, OAuth, apps nativos.

## Repositório

```txt
apps/web          membros e vitrine
apps/admin        super-admin
packages/core     auth, mail, identity, db, comunidades
packages/modules  directory, showcase, contact-mediated
packages/ui       primitives shadcn + compostos membro/ops
db/migrations     SQL datado (sem Prisma)
docs/             contrato do produto
```

Pacotes npm: `@community/*`. O nome do repo no GitHub é [comuna](https://github.com/colabcolibri/comuna).

## Configuração

Cópia mínima em `.env.example`. Contrato completo: [`docs/08_environments.md`](docs/08_environments.md).

| Variável | Função |
| -------- | ------ |
| `DATABASE_URL` | Postgres |
| `JWT_SECRET` | Sessão |
| `SMTP_HOST` / `SMTP_PORT` | Envio (vazio = não envia) |
| `EMAIL_FROM_ADDRESS` | From de fallback |
| `NEXT_PUBLIC_APP_URL` | URL da web de membros |
| `INITIAL_SUPER_ADMIN_EMAIL` | Seed do ops |

Não commitar `.env`. `ALLOW_DEV_OTP=true` só no local — nunca em produção.

## Testes

```bash
pnpm test
```

Vitest. Estratégia: [`docs/10_test_strategy.md`](docs/10_test_strategy.md).

## Documentação

O produto vive em `docs/`, não neste README.

| Doc | Conteúdo |
| --- | -------- |
| [00_scope](docs/00_scope.md) | O que é / o que não é |
| [05_architecture](docs/05_architecture.md) | Apps, pacotes, plugins |
| [06_database](docs/06_database.md) | Schema |
| [07_api_contracts](docs/07_api_contracts.md) | HTTP |
| [08_environments](docs/08_environments.md) | Local, env, SMTP |
| [09_design_system](docs/09_design_system.md) | UI |
| [Índice](docs/README.md) | Todos os phase docs |
