---
title: Scope
status: draft
version: 1.1
updated: 2026-09-14
depends_on: []
blocks: [01_tech_stack.md, 04_principles.md, 05_architecture.md]
---

# 00 — Scope

## Name and description

**Product name:** Alumni Platform

A plataforma **Alumni Platform** é um espaço web de conexão, colaboração e oportunidade profissional para redes de ex-alunos. Ela funciona no navegador e permite que membros da rede compartilhem talentos, encontrem parceiros de projetos e disponibilizem seu perfil para contratação por terceiros ou contratantes externos.

## Problem it solves

**Before:** Ex-alunos não possuem um canal centralizado e confiável para descobrir quais projetos outros membros da rede estão desenvolvendo, quais competências/talentos possuem ou se estão disponíveis para contratação/parcerias. A contratação ou colaboração ocorre de forma fragmentada e informal.

**After:** Um diretório centralizado, transparente e seguro onde membros expõem seus talentos e disponibilidade, permitindo conexões de projetos entre membros e contratação de ex-alunos por partes interessadas.

**Why now:** Hipótese de produto greenfield para engajar a comunidade alumni e fomentar oportunidades econômicas e colaborativas para seus membros.

## Who it is for

| Audience | Role / context | Technical level | Primary need |
| -------- | -------------- | --------------- | ------------ |
| Alumni (Membro) | Ex-aluno da instituição | Variado | Expor talentos/disponibilidade, encontrar projetos e parceiros, receber propostas de trabalho |
| Coordenador | Gestor de comunidade/turma | Médio | Validar membros da sua turma/região e moderar a rede sem acesso a configurações globais |
| Recrutador / Contratante | Visitante externo ou empresa parceira | Baixo / Médio | Buscar talentos na rede alumni e entrar em contato para contratação |
| Administrador Geral | Gestor global da rede Alumni | Médio / Alto | Gerenciar permissões globais, administradores e manter integridade do sistema |

## In initial scope (v1)

1. Autenticação simples sem senha (Passwordless via código enviado por e-mail com persistência de sessão).
2. Perfil de Alumni com talentos, portfólio/projetos atuais e status de disponibilidade (ex: para contratação, mentoria ou novos projetos).
3. Busca e filtro de membros da rede por talentos, áreas de atuação e disponibilidade.
4. Vitrine/Diretório público para visualização e solicitação de contato/contratação por parte de externos/recrutadores.
5. Controles de privacidade onde o membro alumni escolhe quais informações de perfil são públicas vs. restritas aos membros da rede.
6. Painel de Moderação/Coordenação para aprovação de membros e gestão de perfis pela coordenação.

## Out of initial scope

- Aplicativos móveis nativos (iOS / Android) — v1 focada exclusivamente em Web responsivo.
- Sistema de mensagens em tempo real interno (chat privado v1 usará redirecionamento/código de e-mail ou links externos como LinkedIn/E-mail).
- Processamento de pagamentos ou contratos dentro da plataforma.
- Autenticação via redes sociais (OAuth / Google / LinkedIn) na v1.

## Known constraints

| Type | Constraint | Impact |
| ---- | ---------- | ------ |
| Autenticação | Sem senha (código por e-mail com persistência) | Exige provedor de e-mail confiável e gerenciamento seguro de sessões |
| Privacidade | Dados sensíveis e controles de visibilidade | Exige política rigorosa de exibição (público vs membros) alinhada com LGPD |

## Assumptions

| # | Assumption | Confidence | Validate by |
| - | ---------- | ---------- | ----------- |
| 1 | Usuários preferem autenticação via código por e-mail a senhas tradicionais | High | Teste de usabilidade no MVP |
| 2 | Visitantes externos/recrutadores acessarão a vitrine sem necessidade de login prévio para buscar talentos | Medium | Feedback do manager |

## Open questions

| # | Question | Owner | Target date |
| - | -------- | ----- | ----------- |
| 1 | Qual provedor de e-mail transacional será utilizado para o envio dos códigos (ex: Resend, SendGrid, SES)? | manager | Phase 01 |

## Gate

Human sets `status: approved` before deepening `01_tech_stack` and security work.
