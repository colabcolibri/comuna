---
title: Ops settings (platform and community)
updated: 2026-09-15
source: docs/05_architecture.md
---

# Ops settings — platform and community

Volta: `docs/05_architecture.md` § Operations (admin app). Superfície: `docs/architecture/surfaces.md`.

Há **dois** níveis. Não misturar: a plataforma é a instalação; a comunidade é o tenant.

## Platform (`/platform`)

Uma row singleton `ops_core.platform_settings`. Ops vê no rail global (junto de comunidades e pessoas).

| Campo | Uso |
| ----- | --- |
| `product_name` | Chrome ops, envelope de e-mail |
| `from_name` / `from_address` | SMTP From (fallback env) |
| `support_url` | Rodapé de e-mail e copy de ajuda |
| `logo_url` | Envelope (http/https ou path da app); vazio = só texto |

Sem MFA, sem apagar a instalação. SMTP **não** é formulário: senha e host ficam no env. A tela de plataforma mostra só status (host/porta/TLS/AUTH sim|não), via `describeSmtpTransport()`.

## Community (`/communities/:id/settings`)

Colunas já existentes (`name`, `slug` read-only, `type`, `is_public_showcase`) mais `settings` jsonb **com chaves conhecidas**.

`type` é enum fechado: `alumni` \| `practice_community` \| `incubator` \| `mentor_network`. Select shadcn, não texto livre.

| `settings` key | Tipo | Uso |
| -------------- | ---- | --- |
| `description` | string curta | Nota interna no admin |
| `showcase_title` | string ≤80 | h1 da vitrine pública; vazio = nome da comunidade |
| `showcase_description` | string ≤500 | Lede da vitrine; vazio = `description` |
| `default_locale` | `pt-BR` \| `en` | Preferência do tenant para e-mails de membership/contato quando a pessoa ainda não tem locale |

Slug não muda nesta versão. Apagar comunidade fora.

## Pessoas da rede

Ops cria `auth_core.users` + `person_core.profiles` por e-mail + nome (`POST /api/admin/people`). Reusa `ensureUserByEmail` / `ensureBareProfile`. E-mail duplicado: 409/400, não segundo user. Não promove `super_admin` por este POST. Convite = kind `person_invite` (login na web).

## Catálogo (complemento)

Além de ordem/span/colunas já entregues: PATCH de **rótulo** do grupo (seed incluso; slug imutável); mover campo **entre grupos** do mesmo tenant (`PATCH`/`POST` com `groupId`). Continua proibido apagar seed e campo não-`attributes`. Select/radio/checkbox: opções estruturadas (`options[]`) no GET/POST/PATCH; UI de linhas no admin.
