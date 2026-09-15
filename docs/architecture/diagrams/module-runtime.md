---
title: Community Platform — module enable flow
subtitle: Flag por community_id; plugin off devolve 404
kind: flow
source_doc: docs/05_architecture.md
updated: 2026-09-15
---

# Module enable flow

```mermaid
flowchart LR
    Admin[apps/admin toggle]
    Table[community_modules.enabled]
    Runtime[isEnabled]
    Web[apps/web]
    Api[plugin API]

    classDef app fill:#0f766e,stroke:#2dd4bf,color:#ecfeff
    classDef store fill:#065f46,stroke:#34d399,color:#ecfdf5
    classDef ext fill:#1e3a5f,stroke:#38bdf8,color:#e0f2fe

    Admin --> Table
    Web --> Runtime
    Runtime --> Table
    Runtime -->|on| Api
    Runtime -->|off| Four04[404]

    class Admin,Web,Runtime,Api app
    class Table store
    class Four04 ext
```
