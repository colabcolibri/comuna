---
title: Database Design
status: review
version: 2.8
updated: 2026-09-16
depends_on: [05_architecture.md]
blocks: [07_api_contracts.md]
---

# 06 — Database design

## Storage model

- **Engine:** PostgreSQL (Docker local; `DATABASE_URL`).
- **Access:** driver `pg` em `packages/core/db` (alvo). Sem ORM nesta versão.
- **Migrations:** `db/migrations/YYYYMMDDHHMMSS_*.sql` na **raiz** da pasta — só DDL (schemas, tabelas, constraints, RLS, triggers). Runner: `pnpm db:migrate`. Histórico incremental pré-squash em `db/migrations/_archive/` (não é aplicado). **Seed** (`pnpm db:seed`): catálogo, `list_fields`, copy, módulos, demo — não corrigir placement/labels via migration.
- **Dev reset:** `pnpm db:setup` = reset + migrate + seed. Só em desenvolvimento; **proibido** como rotina em produção.
- **Tenancy:** toda query de rede filtra `memberships.community_id`. `super_admin` não usa `community_id` para “ver tudo na vitrine”; ops lista comunidades, não o diretório de talentos.
- **Who writes:** app usa `SET LOCAL ROLE community_app` (NOBYPASSRLS) e `set_config` de `app.user_id` / `app.community_id` nas queries de perfil e membership. Copy bilingue digitado: só headline/bio. Cidade: objeto Nominatim. Migrate/seed na role dona do banco. Sem ORM. Instância demo no host: `DATABASE_READ_ONLY=1` no **pool da app** (`default_transaction_read_only`); migrate/seed usam `Client` sem essa opção, na mesma `DATABASE_URL`.
- **Backup:** dump Postgres no host de prod (procedimento no `08` quando houver prod). Sem `db reset`.

O ER abaixo é o contrato. Migrações em `db/migrations/` aplicam o núcleo e os plugins first-party.

## Modelagem Multi-Tenant / Multi-Comunidade (Cohorts & Networks)

Para transformar a plataforma em uma **Infraestrutura Genérica de Redes/Comunidades** (onde Alumni é apenas UMA das comunidades possíveis, ao lado de Comunidades de Prática, Incubadoras, Grupos de Pesquisa, Mentoria, etc.), a arquitetura adota o modelo **Multi-Tenant Lógico baseado em `tenant_id` / `community_id`**.

```mermaid
erDiagram
    "auth_core.users" ||--O| "person_core.profiles" : "identifica (1:1)"
    "auth_core.users" ||--O{ "network_core.memberships" : "participa em N redes"
    "network_core.communities" ||--O{ "network_core.memberships" : "possui membros"
    "network_core.communities" ||--O{ "network_core.community_modules" : "liga plugins"
    "plugin_core.modules" ||--O{ "network_core.community_modules" : "catalogo"
    "network_core.communities" ||--O{ "network_core.cohorts" : "possui turmas/grupos"
    "network_core.cohorts" ||--O{ "network_core.memberships" : "associa membro a cohort"
    "network_core.memberships" ||--o| "plugin_directory.cards" : "card desta comunidade"
    "network_core.communities" ||--O{ "plugin_directory.field_groups" : "grupos de perfil"
    "plugin_directory.field_groups" ||--O{ "plugin_directory.fields" : "campos"
    "network_core.skills" ||--O{ "network_core.member_skills" : "tagged in"

    "auth_core.users" {
        uuid id PK
        string email UK
        string global_role "user | super_admin"
        string status "active | suspended"
        timestamp created_at
    }

    "person_core.profiles" {
        uuid id PK
        uuid user_id FK, UK
        string full_name
        string avatar_url "URL pública estável; ficheiro no ObjectStore"
        string preferred_locale "pt-BR | en"
        string gender "woman | man | non_binary | prefer_not"
        string birth_country "ISO 3166-1 alpha-2"
        string current_country
        jsonb birth_city "Nominatim place {osm_id, label from geocoder}"
        jsonb current_city "Nominatim place"
        jsonb languages "[{code ISO 639-1, proficiency basic|intermediate|advanced|fluent|native}]"
        jsonb contacts "{linkedin, github, portfolio}"
        timestamp updated_at
    }

    "plugin_core.modules" {
        uuid id PK
        string slug UK
        string version
    }

    "network_core.community_modules" {
        uuid community_id FK
        uuid module_id FK
        boolean enabled
        primary_key(community_id, module_id)
    }

    "network_core.communities" {
        uuid id PK
        string slug UK "ex: alumni-2024, dev-community, ai-research"
        string name "Nome da Comunidade/Rede"
        string type "alumni | practice_community | incubator | mentor_network"
        boolean is_public_showcase "Se a comunidade possui vitrine externa"
        jsonb settings "description, showcase_title, showcase_description, default_locale — ver ops-settings.md"
        timestamp created_at
    }

    "ops_core.platform_settings" {
        uuid id PK "singleton"
        string product_name
        string from_name
        string from_address
        string support_url
        string logo_url
        timestamp updated_at
    }

    "ops_core.email_templates" {
        uuid id PK
        string kind "member_otp | ops_otp | person_invite | contact_notice"
        string locale "pt-BR | en"
        string subject
        string heading
        text body
        text html_body "snapshot gerado"
        text text_body "snapshot gerado"
        timestamp updated_at
        unique(kind, locale)
    }

    "network_core.cohorts" {
        uuid id PK
        uuid community_id FK
        string name "Ex: Turma 2024, Edicao 01, Grupo IA"
        string code "ex: T2024-1"
        timestamp created_at
    }

    "network_core.memberships" {
        uuid id PK
        uuid community_id FK "ISOLAMENTO MULTI-TENANT"
        uuid user_id FK
        uuid cohort_id FK "Opcional: Cohort/Turma dentro da comunidade"
        string network_role "member | coordinator"
        string network_status "pending_approval | active | suspended"
        timestamp joined_at
    }

    "plugin_directory.cards" {
        uuid membership_id PK, FK
        jsonb headline "LocalizedText"
        jsonb bio "LocalizedText"
        string availability_status "available_for_hire | project_partner | mentor | unavailable"
        boolean public_showcase
        jsonb custom_attributes "escalares; chaves = fields.name"
    }

    "plugin_directory.field_groups" {
        uuid id PK
        uuid community_id FK
        string slug
        jsonb label "LocalizedText"
        jsonb description "LocalizedText"
        integer sort_order
        integer columns "1-3"
        boolean enabled
    }

    "plugin_directory.fields" {
        uuid id PK
        uuid group_id FK
        string name "slug de armazenamento"
        string type "text | textarea | localized_text | select | radio | checkbox | boolean | city | url"
        jsonb label "LocalizedText"
        jsonb description "LocalizedText"
        jsonb options "[{value, label LocalizedText}]"
        integer span "1-3"
        boolean required
        boolean enabled
        integer sort_order
        string storage "person | card_column | attributes"
        string column_key "opcional: full_name, availability_status, …"
        uuid module_id FK "null = núcleo; senão plugin_core.modules"
    }

    "plugin_directory.list_fields" {
        uuid field_id FK
        string list_key "directory | showcase"
        boolean filterable
        string placement "off | detail | card"
        primary_key(field_id, list_key)
    }

    "network_core.skills" {
        uuid id PK
        uuid community_id FK "Skills isoladas por comunidade ou globais"
        string name
        string category
    }

    "network_core.member_skills" {
        uuid membership_id FK
        uuid skill_id FK
        primary_key(membership_id, skill_id)
    }

    "auth_core.verification_tokens" {
        uuid id PK
        string email FK
        string code_hash
        integer attempts
        timestamp expires_at
        timestamp created_at
    }
```

---

## Como Funciona o Isolamento Multi-Tenant & Cohorts

### 1. Uma Pessoa (perfil-base), Múltiplas Comunidades (`memberships`)
- Uma conta `users` + perfil-base (identidade + demografia + cidades geocodificadas).
- A mesma pessoa pode ser `member` numa comunidade e `coordinator` noutra.
- Headline, bio, vitrine, availability: colunas de `plugin_directory.cards`. Catálogo em `field_groups` / `fields`. `custom_attributes` guarda só valores escalares de campos `storage=attributes`; não substitui LocalizedText nem a definição do campo.

### 2. Isolamento por `community_id` (Tenant ID)
- Todas as consultas, buscas no diretório e ações administrativas filtram obrigatoriamente pelo `community_id`.
- Um coordenador de uma comunidade *não enxerga* nem possui acesso aos membros de outra comunidade, a menos que ele também seja coordenador dessa outra rede.

### 3. Suporte a Cohorts / Turmas / Edições
- A tabela `cohorts` permite agrupar membros dentro da mesma comunidade (ex: *"Turma de Engenharia 2023"*, *"Edição de Inverno 2024"*).
- Coordenadores podem ser atribuídos para moderar um `cohort` específico.

---

## Padrão de schemas PostgreSQL

1. **`auth_core`**: `users.global_role` (`user | super_admin`) e `verification_tokens`.
2. **`person_core`**: identidade, demografia, GeoPlace de cidades, languages, contacts.
3. **`network_core`**: `communities`, `memberships` (`network_role`: `member | coordinator`), `community_modules`, `cohorts` (núcleo de agrupamento; UI extra pode ser plugin depois).
3b. **`ops_core`**: `platform_settings` (uma row) e `email_templates` (overlay por kind+locale). Não é plugin.
4. **`plugin_core`**: catálogo `modules`.
5. **`plugin_directory`**: `cards` (headline/bio LocalizedText, availability, vitrine, `custom_attributes`); `field_groups` e `fields` por `community_id`; `list_fields` (filtro e placement por lista). Skills no ER legado `network_core.skills` ainda não existem em SQL.
6. **`plugin_contact`**: `messages` (pedido mediado: nome e e-mail obrigatórios, telefone opcional, corpo ≥ 40). Sem inbox in-app.

`community_admin` fora da v2.0.0.

Índice extra: `community_modules (community_id)` unique pair já é PK.

Comunidade nova: insert de `community_modules` para first-party (`directory`, `showcase`, `contact-mediated`, `map`) com `enabled = true`. A coluna permanece `DEFAULT false`: **sem row o plugin está off**.

## Hot paths / indexes (alvo da primeira migração)

- `auth_core.users (email)` unique.
- `verification_tokens (email, expires_at)`.
- `memberships (community_id, network_status)`.
- `memberships (community_id, user_id)` unique.
- `plugin_directory.field_groups (community_id, slug)` unique.
- `plugin_directory.fields (group_id, name)` unique.
- `plugin_directory.fields.module_id` nullable FK `plugin_core.modules` (null = núcleo).
- GIN em `plugin_directory.cards (custom_attributes)` (`jsonb_path_ops`) para facets `@>`.

## Retention

- OTP rows: apagar ou ignorar após `expires_at` (job simples ou delete on read).
- Perfis: enquanto a conta existir; exclusão é US de LGPD se não entrar no perfil v2.0.0.
