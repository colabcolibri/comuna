---
title: User Types and Roles
status: draft
version: 1.1
updated: 2026-09-14
depends_on: [00_scope.md, 02_security.md]
blocks: [05_architecture.md]
---

# 03 — User types and roles

## Profiles

| Role ID | Role Name | Description | Access Level |
| ------- | --------- | ----------- | ------------ |
| `guest` | Visitante / Recrutador | Pessoa externa buscando talentos alumni | Acesso apenas à vitrine pública de perfis (sem dados de contato direto) |
| `alumni` | Membro Alumni | Ex-aluno autenticado da rede | Acesso total ao diretório de membros, projetos, busca interna e gerenciamento do próprio perfil |
| `coordinator` | Coordenador | Gestor intermediário da comunidade/turma/regional | Validação/aprovação de novos alumni, moderação de conteúdos locais e auxílio em conexões |
| `admin` | Administrador Geral | Gestor global da plataforma | Gestão de permissões, configurações globais da plataforma e controle total de sistema |

## Permissions matrix

| Feature / Action | Guest | Alumni | Coordinator | Admin |
| ---------------- | ----- | ------ | ----------- | ----- |
| Visualizar Vitrine pública | ✅ | ✅ | ✅ | ✅ |
| Buscar membros e projetos no diretório interno | ❌ | ✅ | ✅ | ✅ |
| Editar próprio perfil e preferências de privacidade | ❌ | ✅ | ✅ | ✅ |
| Enviar proposta de contratação/contato | ✅ (mediado) | ✅ | ✅ | ✅ |
| Validar/aprovar cadastro de novos alumni | ❌ | ❌ | ✅ | ✅ |
| Moderar conteúdos / perfis da comunidade | ❌ | ❌ | ✅ | ✅ |
| Gerenciar cargos e permissões do sistema | ❌ | ❌ | ❌ | ✅ |
| Configurações globais e exportação de dados | ❌ | ❌ | ❌ | ✅ |
