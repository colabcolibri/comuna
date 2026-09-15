---
title: List surfaces
updated: 2026-09-15
source: docs/05_architecture.md
---

# Listas — diretório e vitrine

Volta: `docs/05_architecture.md`. Catálogo: `docs/architecture/profile-fields.md`. Vitrine: `docs/architecture/showcase-public.md`.

O **campo** descreve o dado no perfil. A **lista** descreve como esse dado entra em cada superfície. Não misturar: filtro de diretório não implica aparecer na vitrine.

## Contrato

`plugin_directory.list_fields`: uma row por (`field_id`, `list_key`).

| Coluna | Valores | Significado |
| --- | --- | --- |
| `list_key` | `directory` \| `showcase` | Qual lista |
| `filterable` | boolean | Sheet de filtros **desta** lista (`attr.*`; `status` se o campo for `availability_status`) |
| `placement` | `off` \| `detail` \| `card` | Onde desenha. `card` implica `detail`. `off` ainda pode ter `filterable` |

Ops configura isto em `/communities/:id/lists/{directory\|showcase}`, não no editor de campos.

Campo novo: diretório `detail` + filtro off; vitrine `off` + filtro off. Não entra sozinho na vitrine.

## Travas

Vitrine: `gender`, `birth_city`, `public_showcase` ficam `off` / filtro false. Nome e foto (`full_name`, `avatar_url`) ficam `card` nas duas listas.

## Projeção

`projectPersonView` (domínio directory) monta slots: identidade, headline, bio, idiomas, availability, facts (label do catálogo), links. UI só desenha. Idiomas nunca misturam com availability.

Densidade `card`: só `placement = card`. Densidade `detail`: `card` ou `detail`.
