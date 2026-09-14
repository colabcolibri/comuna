# Alumni Platform

Plataforma de conexão e contratação para a rede de ex-alunos (alumni).

## Phase documents

| Doc | Status | Description |
| --- | ------ | ----------- |
| [00_scope.md](00_scope.md) | draft | Escopo do produto e fronteiras da v1 |
| [01_tech_stack.md](01_tech_stack.md) | draft | Linguagens, frameworks, infraestrutura |
| [02_security.md](02_security.md) | draft | Modelo de ameaças, autenticação sem senha, privacidade e segredos |
| [03_user_types.md](03_user_types.md) | draft | Perfis (Alumni, Visitantes/Recrutadores, Admin) e permissões |
| [04_principles.md](04_principles.md) | draft | Princípios de engenharia, camadas e Definition of Done |
| [05_architecture.md](05_architecture.md) | draft | Estrutura do sistema — **gate para o backlog** |
| [06_database.md](06_database.md) | draft | Esquema de banco de dados e migrações |
| [07_api_contracts.md](07_api_contracts.md) | draft | Contratos de API e integração |
| [08_environments.md](08_environments.md) | draft | Setup local, CI/CD e variáveis de ambiente |
| [09_design_system.md](09_design_system.md) | draft | Sistema de design e componentes de UI |
| [10_test_strategy.md](10_test_strategy.md) | draft | Pirâmide de testes e estratégia de QA |
| [11_decisions.md](11_decisions.md) | draft | Registro de decisões (histórico via SQLite) |

## Delivery artifacts

| Artifact | Location | Role |
| -------- | -------- | ---- |
| Epics, versions, sprints, user stories | `.meridian/meridian.db` | Canonical delivery |
| Decision log entries | `.meridian/meridian.db` → `decisions` | Prepend-only log |
| Kit templates | `.agent/references/templates/` | Agent contracts |

## How to work

1. Aprovar documentos em ordem de dependência: `00` → `01` → `02` → `03` → `04` → **`05`** → detalhados (`06`–`10`).
2. Após `05_architecture.md` estar **`approved`**: `/create-epic` → `/create-version` → `/plan-sprint` → `/create-us`.
3. Para cada US: `/refine-us` → `/implement-us` → `/complete-us`.
4. Validação: `python3 .agent/scripts/validate_meridian.py .`
