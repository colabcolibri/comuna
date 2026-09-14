---
title: Security
status: draft
version: 1.2
updated: 2026-09-14
depends_on: [00_scope.md, 01_tech_stack.md]
blocks: [03_user_types.md, 04_principles.md, 05_architecture.md]
---

# 02 — Security

## Security posture summary

| Attribute | Value |
| --------- | ----- |
| **Exposure** | Internet (vitrine) + app autenticada + ops restrita |
| **Auth required** | Vitrine pública sem login; diretório e coordenação com sessão; ops só `super_admin` |
| **Sensitive data** | PII de pessoas, e-mail, OTP hashes, JWT |
| **Compliance** | LGPD |
| **Trust boundary** | Autorização no servidor (SQL + middleware). UI não é controle de acesso. |

## Data classification

| Class | Examples in this product | Storage | Retention | Encryption |
| ----- | ------------------------ | ------- | --------- | ---------- |
| Public | Nome, headline, skills e disponibilidade marcados públicos | PostgreSQL | Enquanto conta ativa | TLS |
| Internal | E-mail, cohort, notas de coordenação | PostgreSQL | Enquanto conta ativa | TLS; at-rest conforme host |
| Confidential | Hash de OTP, JWT secret, SMTP key | Postgres / env | OTP: 10 min; JWT: 30 dias membro / 7 dias ops | TLS; secret só em env |

**PII inventory:** Nome, e-mail, foto, links, localização opcional, cohort.

**Data minimization:** Sem CPF, endereço residencial, dados bancários na v2.0.0.

## Privacy — LGPD (Brazil)

| Topic | This product |
| ----- | ------------ |
| Controlador / operador | Instituição da rede (controlador); app é operadora técnica |
| Bases legais (Art. 7) | Execução de adesão à rede + consentimento para vitrine pública |
| Direitos do titular (Art. 18) | Editar, restringir visibilidade, solicitar exclusão (US futura se não couber na v2.0.0 de perfil) |
| Encarregado (DPO) | Definir e-mail real — `dpo@alumni.org` é placeholder |
| RIPD necessário? | Não na v2.0.0 (dados comuns) |
| Retenção e exclusão | Pedido do titular ou encerramento |
| Transferência internacional | Depende do host; documentar no `08` quando houver prod |
| Incidentes | Notificar encarregado; prazo operacional 48h |

## Privacy — GDPR (EU/EEA)

_N/A até expansão europeia._

## Authentication model

| Surface | Mechanism | Session / token | Expiry | Notes |
| ------- | --------- | --------------- | ------ | ----- |
| Vitrine | Nenhum | N/A | N/A | Só dados públicos |
| Member web | OTP e-mail | Cookie HttpOnly JWT | 30 dias se “manter conectado”; senão sessão curta | Sem senha |
| Coordination (same app) | Mesmo OTP + `network_role` | Mesmo cookie | 30 dias | `coordinator` na membership |
| Ops | OTP para conta `super_admin` **ou** mesmo IdP, cookie distinto | Cookie HttpOnly JWT `ops` | 7 dias | Nunca promover papel por string de e-mail |

**Password policy:** N/A.

**MFA:** Fora da v2.0.0.

**Account recovery:** Novo OTP.

## Authorization model

| Role / profile | Can | Cannot | Enforced where |
| -------------- | --- | ------ | ------------- |
| `guest` | Vitrine/contato se plugin on | Diretório, e-mail real | API pública |
| `member` | Perfil-base + plugins enabled | Aprovar outros | Membership `member` + `community_id` |
| `coordinator` | Fila da **sua** comunidade | Admin / toggles globais | `network_role` + `community_id` |
| `super_admin` | Admin: comunidades, papéis, módulos | Navbar Stitch como poder | `apps/admin` + `global_role` |

**Model type:** RBAC + isolamento por `community_id`.

## Threat model (STRIDE summary)

| Surface | Threat actors | Top STRIDE threats | Mitigation | Residual risk |
| ------- | ------------- | ------------------ | --------- | ------------- |
| `POST /api/auth/request-otp` | Bot | DoS / spam de e-mail | Rate limit 3/min IP+e-mail; não devolver OTP no JSON | Medium até o limitador existir |
| Verify OTP | Atacante | Brute force | 5 tentativas; hash SHA-256; timing-safe compare | Low |
| Vitrine | Scraper | Disclosure de contato | Contato mediado; e-mail nunca no HTML público | Low |
| Ops | Session hijack | Elevation | Cookie separado; sem link na navbar do membro | Medium até MFA |
| Código atual | Qualquer um | Auth bypass | Cookie simulado e `dev_otp` — **dívida**; US de auth real | High hoje |

## Secrets and configuration

| Secret type | Storage | Rotation | Never in Git |
| ----------- | ------- | -------- | ------------ |
| `DATABASE_URL` | `.env` | 90 dias | Sim |
| `JWT_SECRET` | `.env` | 180 dias | Sim |
| SMTP / Resend key | `.env` | Conforme provedor | Sim |

`.env` gitignored; `.env.example` só sintético.

## Rate limiting and abuse

| Endpoint / action | Limit | Response | Notes |
| ----------------- | ----- | -------- | ----- |
| Request OTP | 3 / min / IP+e-mail | 429 | Postgres ou middleware; não Redis obrigatório |
| Verify OTP | 5 tentativas / token | 400 e invalida token | |
| Contact | 5 / hora / IP | 429 | |

## AI and automation safety (Meridian / agents)

- Agentes não criam credenciais reais (**HAR**).
- Proibido `db reset` e apagar banco (regra do manager).

## Gaps / open questions

| # | Gap | Severity | Owner | Target |
| - | --- | -------- | ----- | ------ |
| 1 | OTP e JWT ainda simulados no código | High | developer via US | EPIC-12 |
| 2 | DPO e-mail placeholder | Medium | manager | antes de prod |
| 3 | MFA ops | Low | later version | |

## Gate

Human sets `status: approved` before treating threat model as locked.
