---
title: "Alumni Platform — Multi-Tenant Architecture Diagram"
subtitle: "Estrutura Multi-Tenant Lógica (communities, cohorts e memberships) para suporte a múltiplas redes"
kind: database
source_doc: docs/06_database.md
updated: 2026-09-14
---

# Alumni Platform — Multi-Tenant Architecture Diagram

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
        string gender "woman | man | non_binary | prefer_not"
        string avatar_url
        jsonb birth_city "LocalizedText"
        string birth_country
        jsonb current_city "LocalizedText"
        string current_country
        jsonb contacts "linkedin, github, portfolio"
        jsonb languages "[{code, proficiency}]"
        string preferred_locale
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
        uuid community_id FK
        uuid user_id FK
        uuid cohort_id FK
        string network_role "member | coordinator"
        string network_status "pending_approval | active | suspended"
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
