# admin

Compostos ops em `@community/ui-admin`. Mesmo contrato visual das páginas membro (`kicker` + `h1` + `lede` + `actions`), cópia própria — não importa `@community/ui-member`.

- `OpsShell` — rail: grupo **Rede** (comunidades + pessoas) sempre; grupo **Nesta comunidade** só depois de abrir um tenant
- `OpsPageHeader` / `OpsPageTemplate` — páginas
- `OpsSection` — h2 + lede (sem card; a lista/tabela é que tem borda)
- `OpsAccordion` — item colapsável (fecha por padrão; ações fora do gatilho)
- `OpsDialog` — detalhe / prévia (não confirmação)
- `OpsAlertDialog` — confirmação destrutiva
- `OpsBadge` — rótulo curto (ex.: super-admin)
- `OpsMoveButtons` — ordem: setas com `aria-label`, sem texto “subir/descer”
- `OpsCombobox` — busca; opções vêm do caller (já paginadas)
- `OpsTable` — listas densas
- `OpsSubnav` — tabs horizontais (não usar no tenant; capítulos vão no rail)

