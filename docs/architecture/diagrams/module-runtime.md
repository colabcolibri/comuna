---
title: "Community Platform — module enable flow"
kind: flow
source_doc: docs/05_architecture.md
updated: 2026-09-14
---

# Module enable flow

```mermaid
flowchart LR
    Admin[apps/admin toggle]
    Table[community_modules.enabled]
    Runtime[module-runtime]
    Web[apps/web]
    Api[plugin API]

    Admin --> Table
    Web --> Runtime
    Runtime --> Table
    Runtime -->|enabled| Api
    Runtime -->|disabled| Four04[404]
```
