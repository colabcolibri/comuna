---
title: Decision Log
status: approved
version: 1.0
updated: 2026-09-14
depends_on: []
blocks: []
---

# 11 — Decision log

Decisions live in **SQLite**: `.meridian/meridian.db` → table `decisions`.

`docs/11_decisions.md` é o índice humano (este arquivo). A fonte da verdade é o banco de dados.

## Entry shape

Cada linha armazena `decision_date`, `entry_index` (0 = mais recente do dia), e `payload_json`:

```json
{
  "time": "18:09",
  "title": "Projeto Alumni iniciado com Meridian",
  "affected_document": "00_scope.md",
  "what_changed": "Inicializacao da estrutura base do Meridian e documento 00_scope.md",
  "why_changed": "Inicio do projeto conforme solicitado pelo manager",
  "impact": "Doc de escopo 00_scope.md criado em draft",
  "responsible": "scrum-master"
}
```

- `time` = horário real do log (`date +"%H:%M"`).
- Novas entradas são **prepended** (`entry_index` 0) para o dia do calendário.
- Nunca editar ou deletar linhas antigas.

## Write

```bash
date +"%Y-%m-%d"
date +"%H:%M"
python3 .agent/scripts/meridian_delivery.py prepend-decision \
  --date "YYYY-MM-DD" \
  --time "HH:MM" \
  --title "…" \
  --affected-document "docs/…" \
  --what-changed "…" \
  --why-changed "…" \
  --impact "…" \
  --responsible "manager"
```

## When to log

| Event | Log? |
| ----- | ---- |
| Project started (init) | yes — first entry |
| Phase doc `approved` → `review` after edit | yes |
| Security / architecture material change | yes |
| US scope change after refine | yes |
| Typo fix | no |

## Recent decisions (index)

| Date | Title | Affected |
| ---- | ----- | -------- |
| 2026-09-14 | Manager reaprovou docs de fase 00-11 para v2.0.0 | `05_architecture.md` |
| 2026-09-14 | Comunidades genéricas, plugins e monorepo | `00_scope.md` |
| 2026-09-14 | Waiver: planejar v2.0.0 com 03 draft e 05 em review | `05_architecture.md` |
| 2026-09-14 | Super-admin fora da UI Stitch; replanejamento v2.0.0 | `00_scope.md` |
| 2026-09-14 | Projeto Alumni iniciado com Meridian | `00_scope.md` |

## Gate

`status: approved` — regras do registro estáveis; fatos novos só via `prepend-decision`.
