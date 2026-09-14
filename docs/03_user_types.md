---
title: User Types and Roles
status: draft
version: 1.3
updated: 2026-09-14
depends_on: [00_scope.md, 02_security.md]
blocks: [05_architecture.md]
---

# 03 — User types and roles

## Profiles

| Role ID | Role Name | Description | Access Level |
| ------- | --------- | ------------ | ------------ |
| `guest` | Visitante | Pessoa externa | Só o que módulos públicos ligados expõem |
| `member` | Membro | Membership `member` (não se chama alumni) | Núcleo da comunidade + plugins enabled |
| `coordinator` | Coordenador | `network_role` na membership | Aprovar entrada daquela comunidade |
| `super_admin` | Administrador geral | `global_role` | App `apps/admin` |

Papel de produto `alumni` **não existe**. Código legado `alumni` / `admin@alumni.org` está fora do contrato.

## Permissions matrix

| Feature / action | Guest | Member | Coordinator | Super-admin |
| ---------------- | ----- | ------ | ----------- | ----------- |
| Ver perfil-base de membros (se a comunidade permitir) | conforme plugin público | ✅ | ✅ | ❌ na app web (usa admin) |
| Editar perfil-base próprio | ❌ | ✅ | ✅ | ❌ na web |
| Campos de diretório (skills, etc.) | — | só se módulo `directory` on | ✅ | liga/desliga módulo |
| Vitrine / contato | só se módulos on | — | — | toggle |
| Aprovar membership | ❌ | ❌ | ✅ | ❌ na fila Stitch |
| Toggle de módulos / criar comunidade | ❌ | ❌ | ❌ | ✅ admin |

## Jobs to be done

- **Membro:** existir na rede certa com o mínimo de dados; extras só se a comunidade pediu o plugin.
- **Coordenador:** controlar quem entra.
- **Visitante:** descobrir pessoas se a vitrine estiver ligada.
- **Super-admin:** provisionar comunidades e o *plugin board*, não “ser membro privilegiado”.

## Gate

Human `approved` com o `00`.
