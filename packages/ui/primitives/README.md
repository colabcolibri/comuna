# @community/ui

Primitives shadcn (Button, Input, InputOTP, Card, …). Um pacote, duas apps.

```txt
packages/ui/primitives   @community/ui          ← shadcn (CLI aqui)
packages/ui/member       @community/ui-member  ← compostos Stitch
packages/ui/admin        @community/ui-admin   ← shell ops
apps/web                 rotas membro
apps/admin               rotas ops
```

Instalar componente:

```bash
cd packages/ui/primitives
pnpm dlx shadcn@latest add <nome> --yes
```

Depois do CLI, se o import vier `from "cn"`, apontar para `src/lib/utils.ts`.

Tema: `src/styles.css` — Tailwind 4 (`@theme inline` + `:root` / `.dark`). Apps só importam o CSS.

