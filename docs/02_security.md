---
title: Security
status: draft
version: 1.1
updated: 2026-09-14
depends_on: [00_scope.md, 01_tech_stack.md]
blocks: [03_user_types.md, 04_principles.md, 05_architecture.md]
---

# 02 — Security

## Security posture summary

| Attribute | Value |
| --------- | ----- |
| **Exposure** | Public Internet (Vitrine pública) / Authenticated Application (Diretório interno & Gestão) |
| **Auth required** | Partial — Vitrine pública aberta a visitantes; Diretório interno, contatos diretos e painel de coordenação exigem autenticação |
| **Sensitive data** | PII (Perfis de ex-alunos, e-mails, histórico profissional/turma) |
| **Compliance** | LGPD (Brasil) |
| **Trust boundary** | Apenas requisições com sessão/cookie JWT validado no servidor acessam rotas privadas e contatos diretos de ex-alunos. |

## Data classification

| Class | Examples in this product | Storage | Retention | Encryption |
| ----- | ------------------------ | ------- | --------- | ---------- |
| Public | Nome público, headline, talentos/skills públicos e disponibilidade | PostgreSQL | Indefinido (enquanto conta ativa) | In Transit (TLS) |
| Internal | E-mail do ex-aluno, histórico de turma, notas internas de moderação da coordenação | PostgreSQL / Redis | Enquanto conta ativa | At Rest & In Transit |
| Confidential | Códigos OTP de e-mail, tokens de sessão JWT, segredos do sistema | Redis / Cookies HttpOnly | OTP: 10 minutos / JWT: 30 dias | At Rest & In Transit |

**PII inventory:** Nome completo, e-mail, foto de perfil, links sociais (LinkedIn/GitHub), histórico educacional/turma e localização (opcional).

**Data minimization:** Não coletamos CPF, endereço residencial, dados bancários ou documentos pessoais na v1.

## Privacy — LGPD (Brazil)

| Topic | This product |
| ----- | ------------ |
| Controlador / operador | Instituição / Gestão Alumni (Controlador) |
| Bases legais (Art. 7) | Execução de contrato/termo de adesão à rede Alumni + Consentimento para exibição de perfil público |
| Direitos do titular (Art. 18) | O titular pode editar dados, alterar privacidade para restrito, ou solicitar exclusão completa de conta no perfil |
| Encarregado (DPO) | `dpo@alumni.org` / Gestão de privacidade da plataforma |
| RIPD necessário? | Não (processamento de dados pessoais comuns de ex-alunos, sem dados sensíveis de alta periculosidade) |
| Retenção e exclusão | Exclusão imediata mediante solicitação do usuário ou encerramento do perfil |
| Transferência internacional | N/A (banco de dados mantido em infraestrutura padrão com TLS) |
| Incidentes — procedimento | Notificação imediata ao encarregado e titulares em até 48h caso ocorra vazamento |

## Privacy — GDPR (EU/EEA)

_N/A — Foco inicial exclusivo na legislação brasileira (LGPD) e usuários no Brasil. Reavaliar se a rede expandir para a Europa._

## Authentication model

| Surface | Mechanism | Session / token | Expiry | Notes |
| ------- | --------- | --------------- | ------ | ----- |
| Web (Público) | Nenhum | N/A | N/A | Apenas leitura de perfis públicos |
| Web (Alumni) | OTP via E-mail (Passwordless) | Cookie HttpOnly JWT | 30 dias (com persistência) | Sem senhas gravadas no banco |
| Admin / Coord | OTP via E-mail + Checagem de Cargo | Cookie HttpOnly JWT | 7 dias | Exige papel `coordinator` ou `admin` |

**Password policy:** N/A (Sistema 100% Passwordless via OTP enviado por e-mail).

**MFA:** Planejado para v2 para perfis Admin/Coordinator.

**Account recovery:** Reenvio de OTP via e-mail cadastrado.

## Authorization model

| Role / profile | Can | Cannot | Enforced where |
| -------------- | --- | ------ | -------------- |
| `guest` | Visualizar vitrine pública | Acessar diretório restrito ou e-mails | Server Middleware / Next API |
| `alumni` | Editar perfil, buscar membros, alterar privacidade | Aprovar cadastros ou moderar terceiros | Server Middleware / Next API |
| `coordinator` | Validar cadastros de alumni, moderar perfis da turma | Alterar configs globais ou papéis de admin | Server Middleware / Next API |
| `admin` | Gestão total da rede, atribuição de coordenadores | N/A | Server Middleware / Next API |

**Model type:** RBAC (Role-Based Access Control)

## Threat model (STRIDE summary)

| Surface | Threat actors | Top STRIDE threats | Mitigation | Residual risk |
| ------- | ------------- | ------------------ | ---------- | ------------- |
| Endpoint OTP (`/api/auth/request-otp`) | Anônimo / Bot | Spoofing / Denial of Service (Spam de e-mails) | Rate limiting por IP (max 3 req/min) + Validação de e-mail | Low |
| Diretório de Alumni | Guest / Bot | Information Disclosure (Scraping de contatos) | Contatos reais ocultos na vitrine; e-mail exposto apenas após login | Low |
| Alteração de Perfil | Alumni malicioso | Tampering / Elevation of Privilege | Checagem estrita de ID do usuário autenticado no servidor | Low |

## Secrets and configuration

| Secret type | Storage | Rotation | Never in Git |
| ----------- | ------- | -------- | ------------ |
| DB credentials | `.env` / Vercel Env | 90 dias | Sim |
| JWT Secret | `.env` / Vercel Env | 180 dias | Sim |
| Email Provider API Key | `.env` / Vercel Env | Conforme necessário | Sim |

- `.env` e `.env.local` incluídos no `.gitignore`.
- Arquivo `.env.example` mantido no repositório com variáveis sintéticas.

## Rate limiting and abuse

| Endpoint / action | Limit | Response | Notes |
| ----------------- | ----- | -------- | ----- |
| Request OTP | 3 por minuto por IP/E-mail | 429 Too Many Requests | Proteção contra abuso de envio de e-mails |
| Verify OTP | 5 tentativas por código | 400 Bad Request / Bloqueio do código | Proteção contra brute-force no código de 6 dígitos |

## AI and automation safety (Meridian / agents)

- Agentes de IA possuem permissão de leitura e edição em `docs/` e `src/`.
- Proibida alteração de chaves reais de API ou criação de credenciais sem requisição explícita (**HAR**).

## Gaps / open questions

| # | Gap | Severity | Owner | Target |
| - | --- | -------- | ----- | ------ |
| 1 | Seleção final da biblioteca de Rate Limiting (ex: `@upstash/ratelimit` com Redis) | Medium | technical-architect | 05_architecture |

## Gate

Human sets `status: approved` before `/architecture` gate and backlog.
