---
title: Module / plugin contract
updated: 2026-09-14
source: docs/05_architecture.md
---

# Modules (plugins)

Volta: `docs/05_architecture.md` § Module runtime.

Inspiração operacional: BuddyBoss (components) e Moodle (plugins): o núcleo autentica e agrupa pessoas; o resto registra-se e pode estar **off**.

## Manifest (por pacote)

Cada `packages/modules/<slug>` exporta:

| Field | Meaning |
| ----- | ------- |
| `slug` | id estável |
| `version` | semver do plugin |
| `requires` | slugs de outros plugins; v2 first-party: vazio ou `directory` para showcase |
| `memberUi` | rotas/slots na web |
| `adminUi` | settings no admin (toggle já é core) |
| `migrations` | SQL próprio prefixado |

O runtime **não** lê o filesystem em runtime de produção de forma mágica: a app **registra** a lista first-party (compile-time registry). Desligar = flag no banco, não desinstalar o pacote.

## Enable / disable

1. Super-admin em `apps/admin` altera `community_modules.enabled`.
2. `module-runtime.isEnabled(communityId, slug)` é a única porta.
3. API do plugin retorna 404 se off (não 200 vazio com campos secretos).
4. Seed da comunidade demo pode ligar `directory` + `showcase` + `contact-mediated`.

Não existe `if (community.type === 'alumni')` no core. Tipo de comunidade é dado + plugins, não um fork.

## Perfil-base vs extra

**Base (`packages/core/identity`):** `full_name`, `avatar_url`, `preferred_locale`.

**Não-base (exemplos de plugin):** headline, bio, skills, disponibilidade, vitrine pública, LinkedIn, gênero, cidades, cohort year.

Se o manager puxar gênero/cidade para o base, isso muda `06` e esta tabela — não se espalha no directory plugin por default.

## Coordination

Aprovar `pending_approval` é **core** (`packages/core/memberships`). Não é o plugin directory.
