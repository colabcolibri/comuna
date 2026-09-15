---
title: Database Design
status: review
version: 2.3
updated: 2026-09-15
depends_on: [05_architecture.md]
blocks: [07_api_contracts.md]
---

# 06 — Database design

## Storage model

- **Engine:** PostgreSQL (Docker local; `DATABASE_URL`).
- **Access:** driver `pg` em `packages/core/db` (alvo). Sem ORM nesta versão.
- **Migrations:** `db/migrations/YYYYMMDDHHMMSS_*.sql` — uma alteração por arquivo. Aplicar com runner documentado na US de persistência. **Proibido** reset/drop de banco como rotina.
- **Tenancy:** toda query de rede filtra `memberships.community_id`. `super_admin` não usa `community_id` para “ver tudo na vitrine”; ops lista comunidades, não o diretório de talentos.
- **Who writes:** app usa `SET LOCAL ROLE community_app` (NOBYPASSRLS) e `set_config` de `app.user_id` / `app.community_id` nas queries de perfil e membership. Copy bilingue digitado: só headline/bio. Cidade: objeto Nominatim. Migrate/seed na role dona do banco. Sem ORM.
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
        string avatar_url
        string preferred_locale "pt-BR | en"
        string gender "woman | man | non_binary | prefer_not"
        string birth_country "ISO 3166-1 alpha-2"
        string current_country
        jsonb birth_city "Nominatim place {osm_id, label from geocoder}"
        jsonb current_city "Nominatim place"
        jsonb languages "[{code, proficiency}]"
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
        jsonb settings "regras especificas da rede"
        timestamp created_at
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
        jsonb custom_attributes
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
- Headline, bio, vitrine, availability: `plugin_directory.cards`. Skills ainda não têm tabela; `custom_attributes` não substitui LocalizedText.

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
4. **`plugin_core`**: catálogo `modules`.
5. **`plugin_directory`**: `cards` com headline/bio LocalizedText, availability, vitrine. Skills no ER legado `network_core.skills` ainda não existem em SQL.

`community_admin` fora da v2.0.0.

Índice extra: `community_modules (community_id)` unique pair já é PK.

## Hot paths / indexes (alvo da primeira migração)

- `auth_core.users (email)` unique.
- `verification_tokens (email, expires_at)`.
- `memberships (community_id, network_status)`.
- `memberships (community_id, user_id)` unique.

## Retention

- OTP rows: apagar ou ignorar após `expires_at` (job simples ou delete on read).
- Perfis: enquanto a conta existir; exclusão é US de LGPD se não entrar no perfil v2.0.0.
