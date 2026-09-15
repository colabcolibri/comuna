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
| Campo (name, tipo, label, description, **required**, opções, span, grupo) | `plugin_directory.fields` | catálogo; gera facets |
| Identidade | `person_core.profiles` | colunas atuais |
| Headline, bio, availability, vitrine | colunas de `plugin_directory.cards` | coluna / LocalizedText |
| Valores custom (boolean, select, texto curto) | `cards.custom_attributes` jsonb | GIN + `@>` |

`name` do campo é o slug de armazenamento. Imutável depois que existir valor. Label é LocalizedText (dado da comunidade). `description` do **grupo** não aparece no perfil — grupo só tem título. `description` do **campo** só existe se o rótulo não basta (formato, exemplo); não é parágrafo de produto. O estado que **sempre** aparece ao lado do rótulo é `required`: **Obrigatório** ou **Opcional**. Chrome da página (salvar, erro, esses dois vocábulos) continua pack + `CONTENT`.

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
| `identity` | core (não some) | nome, avatar (`image`) | `person` |
| `community_copy` | directory | título, apresentação | `card_column` |
| `person` | core | gênero, cidades, idiomas (12 códigos + nível) | `person` |
| `links` | core | linkedin, github, portfólio | `person` |
| `availability` | directory + showcase | availability (`directory`); `public_showcase` (`showcase`) | `card_column` |
| (custom) | directory | o que a comunidade pedir | `attributes` |

Hospitalidade (`host_at_home`) **não** é seed de plataforma. Só a comunidade `demo` ganha esse grupo no `db:seed`. Comunidade nova: núcleo + headline/bio/availability + grupo `custom` vazio. Ops cria extras por tenant.

Ops reordena grupos e campos (`sort_order`); a lista do admin é a ordem do formulário de perfil. `locked` não congela ordem, densidade **nem `required` / `enabled`**: só impede apagar grupo seed e campo com `storage` ≠ `attributes`. Campo e grupo têm `enabled` (default true). **Desativar** some do perfil do membro e não pede confirmação. **Excluir** só com `enabled = false`, e só depois de `OpsAlertDialog`. Núcleo pode desativar; não apaga. Grupo custom só apaga se estiver desativado **e** vazio. A tela de campos é **lista + detalhe**: cada grupo é um `OpsAccordion` **fechado** (nome, badges, ações no cabeçalho; campos só depois de abrir); campo na linha (rótulo, tipo humano, obrigatório/opcional, setas). **Criar grupo** fica no topo da página; **adicionar campo** só no rodapé do grupo (sem seletor de grupo na criação). Rótulos pt/en do grupo abrem em «renomear». Editar o campo guarda copy/opções/filtro dos extras; `required`, `span`, `enabled` e mudança de grupo ficam no mesmo painel (núcleo incluso). `span` só aparece se o grupo tem `columns` > 1, com opções 1…`columns`. Mover de grupo pede confirmação (`OpsAlertDialog`). Internos (`name`, `storage`) não são a linha principal. Comunidade nova recebe o seed de `scripts/seed-directory-catalog.cjs` mais o grupo `custom`. Write do membro recusa campo `required` em branco (`boolean` preenchido conta mesmo `false`).

`columns` no grupo (1–3) é **campos por linha no perfil** em tela larga — não coluna de banco. Ops altera em qualquer grupo, inclusive seed, com rótulos (“um embaixo do outro” / lado a lado). `span` no campo (1–3) ocupa o grid. Mobile: sempre empilha. A prévia no ops **não fica no cartão**: o botão **Como fica** abre um `OpsDialog` com essa linha larga. Rótulo com obrigatório/opcional **colado no nome** (não no canto direito da célula — isso vira um segundo campo). `localized_text` tem duas colunas com legenda `pt-BR` / `en`, como o perfil. Grupo `identity` mostra foto ao lado do nome. Em viewport estreito a silhueta rola no eixo x dentro do diálogo; a página não transborda. Lista fechada: `Select` shadcn (`SelectTrigger` / `SelectContent` / `SelectItem` em `@community/ui`). Combobox de busca continua `OpsCombobox`. Ordem na UI: setas com rótulo acessível. Sem pin de `identity` nesta versão.

## Tipos (templates)

`text`, `textarea`, `localized_text`, `select`, `radio`, `checkbox`, `boolean`, `city`, `url`.

`select`, `radio` e `checkbox` são **lista fechada**: cada opção tem `value` único (slug) e label LocalizedText. Catálogo ops recusa lista vazia ou `value` repetido. Write do membro (`custom_attributes`) recusa valor fora de `fields.options` — inclusive checkbox (não descarta em silêncio). `text` / `textarea` / `boolean` / `url` / `city` / `localized_text` / `image` não usam `options`.

Renderer: um `FieldControl` por tipo em UI compartilhada (`@community/ui` + compostos member). A página de perfil só mapeia binding → estado. Não duplicar `<select>` de availability fora do template `select`. Ops lança as opções em linhas (`options[]`); o textarea `valor|pt|en` não é a UI.

`languages` (núcleo, `storage: person`): tipo `checkbox` com 12 códigos (`pt`, `en`, `es`, `fr`, `de`, `it`, `nl`, `zh`, `ja`, `ko`, `ru`, `ar`). O valor persistido é `[{ code, proficiency }]`. Níveis: `basic`, `intermediate`, `advanced`, `fluent`, `native`. No perfil: lista do preenchido (borda de campo) + CTA **Adicionar novo idioma** abre `AppDialog` (`sm`) com idioma e nível empilhados como os outros `FieldControl`. O select do diálogo só lista códigos que ainda não estão no perfil. Editar reabre o mesmo diálogo; remover na linha. Lista canónica em `@community/identity`.

## Plugins default on

First-party (`directory`, `showcase`, `contact-mediated`): comunidade nova e seed nascem com `community_modules.enabled = true`. Toggle na app admin já existe como API; **esta fatia não exige UI nova**. Runtime continua `isEnabled`. Perfil directory 404 se off.

## Pesquisa no diretório

Texto de nome/headline/bio: como hoje. Facets de campos `filterable` (boolean/select): `custom_attributes @> '{"name": value}'`. Availability: filtro na coluna, não no blob. Sem FTS em textarea custom nesta versão.

## Fora deste contrato

Tabela EAV de valores, skills SQL, builder visual de layout, FTS em respostas longas.
