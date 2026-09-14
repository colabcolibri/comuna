---
title: Engineering Principles
status: draft
version: 1.0
updated: 2026-09-14
depends_on: [00_scope.md]
blocks: [05_architecture.md]
---

# 04 — Engineering principles

## Core principles

1. **Privacy-first by design:** Dados de ex-alunos pertencem a eles. Nenhuma informação privada deve ser vazada na API pública.
2. **KISS (Keep It Simple, Stupid):** Autenticação por e-mail sem senhas para evitar complexidade desnecessária de reset de senha e gerenciamento de hash.
3. **Documentação precede o código:** Nenhuma User Story é codificada sem o baseline de documentação aprovado e US com status `ready: true`.

## Definition of Done (DoD)

Para que uma User Story seja concluída (`✅`):
- Código implementado e aderente aos tipos TypeScript.
- Testes unitários/integração cobrindo os critérios de aceite.
- Registro em `## Record` preenchido com evidências objetivas de teste/execução.
