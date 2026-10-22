---
title: User Types and Roles
status: approved
version: 1.4
updated: 2026-10-22
depends_on: [00_scope.md, 02_security.md]
blocks: [05_architecture.md]
---

# 03 — User types and roles

## Profiles

| Role ID | Role Name | Description | Access Level |
| ------- | --------- | ------------ | ------------ |
| `guest` | Visitante | Pessoa externa | Só o que módulos públicos ligados expõem |
| `member` | Membro | Membership `member` (não se chama alumni) | Núcleo da comunidade + plugins enabled |
| `coordinator` | Coordenador | `network_role` na membership | Fila de entrada na web; **admin** com escopo só nos tenants em que coordena |
| `super_admin` | Administrador geral | `global_role` | App `apps/admin` (rede inteira) |

Papel de produto `alumni` **não existe**. Código legado `alumni` / `admin@alumni.org` está fora do contrato.

## Permissions matrix

| Feature / action | Guest | Member | Coordinator | Super-admin |
| ---------------- | ----- | ------ | ----------- | ----------- |
| Ver perfil-base de membros (se a comunidade permitir) | conforme plugin público | ✅ | ✅ | ❌ na app web (usa admin) |
| Editar perfil-base próprio | ❌ | ✅ | ✅ | ❌ na web |
| Campos de diretório (skills, etc.) | — | só se módulo `directory` on | ✅ | liga/desliga módulo |
| Vitrine / contato | só se módulos on | — | — | toggle |
| Aprovar membership | ❌ | ❌ | ✅ | ❌ na fila da web (ops muda status no roster) |
| Pedir entrada | ❌ (precisa sessão) | ✅ se ainda não tem assento | — | ❌ na web |
| Toggle de módulos no tenant | ❌ | ❌ | ✅ admin (só comunidades onde coordena) | ✅ admin (qualquer tenant) |
| Criar comunidade / pessoas da rede / plataforma / e-mails | ❌ | ❌ | ❌ | ✅ admin |

## Jobs to be done

- **Membro:** existir na rede certa com o mínimo de dados; extras só se a comunidade pediu o plugin.
- **Coordenador:** controlar quem entra; operar o tenant (membros, campos, listas) no admin quando for coordenador ativo.
- **Visitante:** descobrir pessoas se a vitrine estiver ligada.
- **Super-admin:** provisionar comunidades e o *plugin board*, não “ser membro privilegiado”.

## Gate

Human `approved` com o `00`.
