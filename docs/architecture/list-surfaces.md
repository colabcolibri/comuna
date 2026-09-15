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

`projectPersonView` (domínio directory) monta slots: identidade, headline, bio, idiomas, availability, facts, links. UI só desenha. Cada extra em `facts` traz **label do catálogo** + `values[]` (checkbox vira vários valores; boolean verdadeiro é só o rótulo). Idiomas e disponibilidade também saem com heading do campo. Idiomas nunca misturam com availability.

Densidade `card`: só `placement = card`. Densidade `detail`: `card` ou `detail`. A UI do diretório desenha `card` em `AppPersonCard` `compact` (sem bio/facts mesmo que o seed deixe bio em `detail`). A vitrine desenha `card` em `AppShowcaseCard` (`teaser`). As duas listas paginam com o mesmo `AppShowcasePager` e os mesmos `page`/`size` (24, 48, 96).

Load: `LIST_FIELDS_SQL` + `parseListFields`. Facets: `attributeFacets`. Filtro `attr.*`: `parseAttrFilters` lê `ListField.filterable`, não o catálogo do perfil.

Seed de extra: `listFilterable: true` no JS vira duas rows em `list_fields` (`detail` + filtro nas duas listas). Não é coluna de `fields`. Campos da plataforma levam `lists` no seed (`scripts/seed-directory-catalog.cjs`); teste `scripts/seed-list-surfaces.test.ts` projeta Helena com essa política.
