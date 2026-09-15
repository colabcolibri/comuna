---
title: Plugin surfaces
updated: 2026-09-15
source: docs/05_architecture.md
---

# Plugin surfaces

Volta: `docs/05_architecture.md` § Module runtime.

Plugin off **não aparece**. A regra é de **setup + filtro genérico**, não de `if` por slug no catálogo nem no chrome.

## Camadas (SRP)

| Peça | Responsabilidade | Não faz |
| --- | --- | --- |
| `packages/modules/*/manifest` | Declara o que o plugin **oferece** (rotas, chrome, slots, seeds) | Filtrar, inferir |
| `plugin_directory.fields.module_id` | Dono do campo no **dado** (setup/seed) | Heurística de `storage` |
| `module-runtime` | `listEnabled` + `visibleContributions(registry, enabled)` | Nomes de campo |
| App web | Monta o que o runtime devolve | `if (slug === 'showcase')` |

Identidade (`module_id` null) e `/profile/edit` núcleo **não** são plugin.

## Manifest (compile-time registry)

A app **registra** first-party numa lista. Não lê filesystem em produção. Um plugin novo = pacote + uma linha no registry. `FIRST_PARTY_SLUGS` **deriva** do registry; não existe lista paralela de slugs no chrome.

Cada módulo exporta `ModuleContribution`:

| Campo | Uso |
| --- | --- |
| `slug`, `version`, `requires` | Identidade e dependência (`showcase` pode exigir `directory`) |
| `routes` | Paths que a app monta se enabled (`/directory`, `/showcase`) |
| `chrome` | Itens de sidebar / header / home (`href` canónico + chave de pack). A app prefixa `/c/{slug}` — o manifesto não leva tenant |
| `slots` | Pontos de extensão (`showcase.rowAction`) |
| `seed` | Grupos/campos que o plugin **insere** (com `module_id` dele) |
| `writesCards` | Se o plugin lê/grava `plugin_directory.cards` |

Filtro único:

```txt
enabled = listEnabled(communityId)
ui      = registry.filter(c => enabled.includes(c.slug))
campos  = fields.filter(f => f.module_id == null || enabledHas(f.module_id))
```

Deep link de rota que não está em `ui.routes` → redirect `/`. API do plugin: 404 se off. Sem copy “módulo desligado”.

## First-party (v2) — contribuição, não if

| Slug | `routes` / `chrome` | `slots` | Campos (`module_id`) |
| --- | --- | --- | --- |
| `directory` | `/directory`, item nav/home | — | headline, bio, availability, `attributes` da comunidade |
| `showcase` | `/showcase`, link vitrine | — | `public_showcase` (coluna em `cards`, **dono é showcase**) |
| `contact-mediated` | — | `showcase.rowAction` | nenhum |

`storage` continua sendo **binding de valor** (`person` / `card_column` / `attributes`). Não é dono de plugin. Um `card_column` pode ser directory (`headline`) ou showcase (`public_showcase`). O seed é quem marca o dono.

## Banco: enable vs dono

`community_modules.enabled` **DEFAULT false**. Sem row = off. Comunidade nova e seed **inserem** first-party `enabled = true`. Desligar: `PUT` `{ enabled: false }`. Aí `visibleContributions` e o filtro de campos esvaziam sozinhos.

`fields.module_id` nullable FK `plugin_core.modules`. Null = núcleo. Não se infere de `column_key`.

## O que a web faz

1. Layout: `enabled = listEnabled`.
2. Shell: `for (item of contributions.chrome)`.
3. Página de perfil: catálogo já filtrado na API (mesmo predicado `module_id`).
4. Slot: só renderiza contributors enabled daquele `slot` id.

Sem `if` de slug em `catalog.ts`, `AppSidebar` ou home — só iteração.

## Barrel do directory

`@community/directory` (e `./lang`) é o que o browser pode importar: pack, contribution, catálogo puro, `coreCatalog`. Writes e seed (`listOpsCatalog`, `createAttributeField`, `seedCommunityCatalog`) saem de `@community/directory/ops` — só Route Handler. O barrel público **não** reexporta `@community/db`: um import no `MemberShell` puxaria `pg` e o bundle do cliente quebra (`Can't resolve 'dns'`).
