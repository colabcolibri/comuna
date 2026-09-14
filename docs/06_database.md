---
title: Database Design
status: draft
version: 2.0
updated: 2026-09-14
depends_on: [05_architecture.md]
blocks: [07_api_contracts.md]
---

# 06 — Database design

## Modelagem Multi-Tenant / Multi-Comunidade (Cohorts & Networks)

Para transformar a plataforma em uma **Infraestrutura Genérica de Redes/Comunidades** (onde Alumni é apenas UMA das comunidades possíveis, ao lado de Comunidades de Prática, Incubadoras, Grupos de Pesquisa, Mentoria, etc.), a arquitetura adota o modelo **Multi-Tenant Lógico baseado em `tenant_id` / `community_id`**.

```mermaid
erDiagram
    "auth_core.users" ||--O| "person_core.profiles" : "identifica (1:1)"
    "auth_core.users" ||--O{ "network_core.memberships" : "participa em N redes"
    "network_core.communities" ||--O{ "network_core.memberships" : "possui membros"
    "network_core.communities" ||--O{ "network_core.cohorts" : "possui turmas/grupos"
    "network_core.cohorts" ||--O{ "network_core.memberships" : "associa membro a cohort"
    "network_core.memberships" ||--O{ "network_core.member_skills" : "possesses"
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
        string gender "female | male | non_binary | prefer_not_to_say | custom"
        string avatar_url
        string birth_city
        string birth_country
        string current_city
        string current_country
        jsonb contacts "linkedin, github, whatsapp, portfolio"
        jsonb languages "lista de idiomas com proficiencia"
        jsonb metadata "timezone, preferencias"
        timestamp updated_at
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
        string headline "Cargo/Titulo do membro nesta rede"
        text bio "Apresentacao especifica para esta comunidade"
        string availability_status "available_for_hire | project_partner | mentor | unavailable"
        string network_role "member | coordinator | community_admin"
        string network_status "pending_approval | active | suspended"
        jsonb custom_attributes "campos especificos da comunidade (ex: ano formatura, projetos)"
        timestamp joined_at
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

### 1. Uma Pessoa (`person_profiles`), Múltiplas Comunidades (`memberships`)
- O usuário possui **uma única conta** (`users`) e **um único perfil pessoal** (`person_profiles` com nome, foto, cidade onde mora, idiomas).
- O mesmo usuário pode ser membro de **múltiplas comunidades** ao mesmo tempo (ex: na comunidade *Alumni* ele é `member`, e na comunidade *Prática de IA* ele é `coordinator`).

### 2. Isolamento por `community_id` (Tenant ID)
- Todas as consultas, buscas no diretório e ações administrativas filtram obrigatoriamente pelo `community_id`.
- Um coordenador de uma comunidade *não enxerga* nem possui acesso aos membros de outra comunidade, a menos que ele também seja coordenador dessa outra rede.

### 3. Suporte a Cohorts / Turmas / Edições
- A tabela `cohorts` permite agrupar membros dentro da mesma comunidade (ex: *"Turma de Engenharia 2023"*, *"Edição de Inverno 2024"*).
- Coordenadores podem ser atribuídos para moderar um `cohort` específico.

---

## Padrão de Schemas PostgreSQL V2

1. **`auth_core`**: Identidade global e tokens.
2. **`person_core`**: Dados da pessoa (nome, foto, localização de origem/atual, idiomas).
3. **`network_core`**: Tabela unificada multi-tenant para qualquer tipo de comunidade/rede (`communities`, `cohorts`, `memberships`, `skills`, `member_skills`).
