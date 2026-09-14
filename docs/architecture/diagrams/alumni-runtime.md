---
title: "Alumni Platform — runtime surfaces"
kind: runtime
source_doc: docs/05_architecture.md
updated: 2026-09-14
---

# Alumni Platform — runtime

```mermaid
flowchart LR
    BrowserMember[Membro / visitante / coordenador]
    BrowserOps[Super-admin]
    Next[Next.js um processo]
    PG[(PostgreSQL)]
    SMTP[SMTP Mailpit ou Resend]

    BrowserMember -->|rotas Stitch + /api membro e coord| Next
    BrowserOps -->|/ops + /api/ops| Next
    Next --> PG
    Next --> SMTP
```
