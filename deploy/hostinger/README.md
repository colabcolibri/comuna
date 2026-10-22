# Deploy VPS (Hostinger / Docker Compose)

Runbook **versionado** do monorepo. Não coloque aqui IP, alias SSH, URLs de produção nem contas reais — isso fica em `MAINTAINER.local.md` (gitignored).

Documentação de produto e variáveis: [docs/08_environments.md](../../docs/08_environments.md) (matriz de env, demo, restrições).

## Arquivos desta pasta

| Arquivo | No git? | Uso |
| ------- | ------- | --- |
| `env.example` | sim | Modelo de `.env.hostinger` na raiz do clone **no servidor** |
| `Caddyfile`, `Dockerfile.*` | sim | Build e TLS |
| `MAINTAINER.local.md.example` | sim | Copiar para `MAINTAINER.local.md` e preencher |
| `MAINTAINER.local.md` | **não** | SSH, host de prod, smoke URLs — só na sua máquina |

```bash
cp deploy/hostinger/MAINTAINER.local.md.example deploy/hostinger/MAINTAINER.local.md
```

## Primeira instalação (no servidor)

Pré-requisitos: VPS Ubuntu com Docker, DNS `A` para vitrine e ops, firewall 22/80/443, Postgres **não** exposto.

```bash
git clone git@github.com:colabcolibri/comuna.git /opt/comuna   # path pode variar; ver MAINTAINER.local.md
cd /opt/comuna
cp deploy/hostinger/env.example .env.hostinger
# editar secrets, COMUNA_HOST, COMUNA_OPS_URL, etc.
docker compose -f docker-compose.hostinger.yml --env-file .env.hostinger up -d --build
# seed uma vez (sem DATABASE_READ_ONLY no env do job seed):
docker compose -f docker-compose.hostinger.yml --env-file .env.hostinger --profile seed run --rm seed
```

O serviço `migrate` roda antes de web/admin e aplica `db/migrations/`.

## Deploy de rotina

Sempre a partir de `main` publicado. No **servidor** (SSH):

```bash
cd /opt/comuna   # ou o path do seu MAINTAINER.local.md
git fetch origin main
git pull --ff-only origin main
docker compose -f docker-compose.hostinger.yml --env-file .env.hostinger up -d --build
```

Do **laptop**, use o one-liner documentado no seu `MAINTAINER.local.md` (alias SSH + path).

**Proibido em produção:** `pnpm db:setup`, `db:reset`, `supabase db reset`, apagar volumes Postgres.

## Verificação rápida

```bash
docker logs comuna_migrate 2>&1 | tail -5
docker ps --format 'table {{.Names}}\t{{.Status}}'
docker exec comuna_web node -e "fetch('http://127.0.0.1:3014/api/health').then(r=>r.text()).then(console.log)"
```

Rollback: checkout/tag anterior no clone + mesmo `compose up -d --build`. Não remover volumes de dados.

## O que não é este caminho

Hospedagem compartilhada Hostinger (só MySQL), GitHub Pages, deploy só por imagem no painel sem build do monorepo — ver `08_environments.md`.
