---
title: Profile field catalog
updated: 2026-09-15
source: docs/05_architecture.md
---

# Profile field catalog

Volta: `docs/05_architecture.md` § Profile field catalog.

Plugin off **não** mostra campos daquele plugin. O dono é `fields.module_id` (setup/seed), não `if` no parser. Ver `docs/architecture/plugin-surfaces.md`.

## Definição vs valor

| Peça | Onde | Pesquisa |
| --- | --- | --- |
| Grupo | `plugin_directory.field_groups` | não busca membro |
| Campo (name, tipo, label, description, opções, span, grupo) | `plugin_directory.fields` | catálogo; gera facets |
| Identidade | `person_core.profiles` | colunas atuais |
| Headline, bio, availability, vitrine | colunas de `plugin_directory.cards` | coluna / LocalizedText |
| Valores custom (boolean, select, texto curto) | `cards.custom_attributes` jsonb | GIN + `@>` |

`name` do campo é o slug de armazenamento. Imutável depois que existir valor. Label e description são LocalizedText (dado da comunidade), não pack de chrome. Chrome da página (salvar, erro) continua pack + `CONTENT`.

## Storage binding

Cada campo tem `storage`:

- `person` — coluna/json conhecido em `person_core.profiles` (`column_key`: `full_name`, `gender`, `birth_city`, `avatar_url`, …). Avatar: o valor é URL estável da app; o ficheiro está no store (`docs/architecture/media.md`).
- `card_column` — `headline`, `bio`, `availability_status`, `public_showcase`.
- `attributes` — chave em `custom_attributes`. Valor **escalar** (`true`, `"yes"`, texto curto). Sem LocalizedText aninhado no blob.

`storage` **não** implica plugin. `module_id` null = núcleo. Directory e showcase marcam o próprio `module_id` no seed (ex.: `public_showcase` é `card_column` no schema directory e **módulo** showcase).

Escrita valida tipo e opções contra o catálogo. Chave não declarada é rejeitada.

## Grupos seed (reordenáveis)

| slug | Origem | Campos | Storage |
| --- | --- | --- | --- |
| `identity` | core (não some) | nome, avatar (`image`, não URL crua) | `person` |
| `person` | core | gênero, cidades, idiomas, links | `person` |
| `community_copy` | directory | headline, bio | `card_column` |
| `availability` | directory + showcase | availability (`directory`); `public_showcase` (`showcase`) | `card_column` |
| (custom) | directory | o que a comunidade pedir | `attributes` |

Grupos extra entram por seed/SQL nesta versão. Builder visual e tela admin de campos ficam para depois.

`columns` no grupo (1–3) define a densidade. `span` no campo (1–3) ocupa o grid. Mobile: uma coluna. Sem overflow horizontal.

## Tipos (templates)

`text`, `textarea`, `localized_text`, `select`, `radio`, `checkbox`, `boolean`, `city`, `url`.

Renderer: um `FieldControl` por tipo em UI compartilhada (`@community/ui` + compostos member). A página de perfil só mapeia binding → estado. Não duplicar `<select>` de availability fora do template `select`.

## Plugins default on

First-party (`directory`, `showcase`, `contact-mediated`): comunidade nova e seed nascem com `community_modules.enabled = true`. Toggle na app admin já existe como API; **esta fatia não exige UI nova**. Runtime continua `isEnabled`. Perfil directory 404 se off.

## Pesquisa no diretório

Texto de nome/headline/bio: como hoje. Facets de campos `filterable` (boolean/select): `custom_attributes @> '{"name": value}'`. Availability: filtro na coluna, não no blob. Sem FTS em textarea custom nesta versão.

## Fora deste contrato

Tabela EAV de valores, skills SQL, builder de campos, FTS em respostas longas.
