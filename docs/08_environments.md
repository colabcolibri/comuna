---
title: Environments and Setup
status: draft
version: 1.2
updated: 2026-09-14
depends_on: [01_tech_stack.md, 05_architecture.md]
blocks: []
---

# 08 — Environments and setup

## Environment Variables Matrix

| Variable | Description | Required? | Example (Synthetic) | Environment |
| -------- | ----------- | --------- | ------------------- | ----------- |
| `PORT` | Porta local de execução da aplicação web | Sim | `3014` | Local |
| `DATABASE_URL` | String de conexão com o PostgreSQL | Sim | `postgresql://postgres:postgres@localhost:5432/alumni_db` | Local / Staging / Prod |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT | Sim | `alumni-super-secret-jwt-key-local-development-2026` | Local / Staging / Prod |
| `INITIAL_ADMIN_EMAIL` | E-mail do Administrador Inicial (SuperAdmin) | Sim | `admin@alumni.org` | Local / Staging / Prod |
| `SMTP_HOST` | Host SMTP para envio de e-mails de teste (Mailpit) | Sim | `localhost` | Local / Staging |
| `SMTP_PORT` | Porta SMTP do Mailpit | Sim | `1025` | Local / Staging |
| `EMAIL_FROM_ADDRESS` | Endereço remetente dos e-mails de OTP | Sim | `auth@alumni.org` | Local / Staging / Prod |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação web | Sim | `http://localhost:3014` | Local / Staging / Prod |

## Local Development Setup

### 1. Pré-requisitos
- Node.js `^20.0.0`
- pnpm ou npm
- Docker Desktop (para PostgreSQL e Mailpit)

### 2. Infraestrutura Local (PostgreSQL & Mailpit)
Suba o banco de dados e a caixa de entrada de testes (Mailpit) usando Docker Compose:

```bash
docker-compose up -d
```

- **PostgreSQL:** Rodando em `localhost:5432`
- **Mailpit Web UI (Caixa de Entrada de E-mails):** Acesse em `http://localhost:8025`

### 3. Instalação e Execução
```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Instalar dependências
pnpm install

# 3. Rodar aplicação na porta 3014
pnpm dev
```

- **Aplicação Web:** `http://localhost:3014`
- **Mailpit (Caixa de Entrada de Testes):** `http://localhost:8025`

## Bootstrapping do E-mail do Admin Inicial (`INITIAL_ADMIN_EMAIL`)

- Quando o sistema é inicializado ou roda o script de seed (`INITIAL_ADMIN_EMAIL`), o usuário cujo e-mail corresponde a esta variável recebe automaticamente a role `admin` (SuperAdmin) no `auth_core.users`.
- Ao digitar esse e-mail na tela de login, o código OTP é enviado normalmente para o Mailpit e o acesso concedido possui privilégios de Administrador Geral.
