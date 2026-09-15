# @community/ui

Primitives shadcn (Button, Input, InputOTP, Card, …). Um pacote, duas apps.

```txt
packages/ui/primitives   @community/ui          ← shadcn (CLI aqui)
packages/ui/member       @community/ui-member  ← compostos Stitch
packages/ui/admin        @community/ui-admin   ← shell ops
apps/web                 rotas membro
apps/admin               rotas ops
```

Instalar componente (na raiz do monorepo):

```bash
npx --yes shadcn@latest add sidebar --yes --cwd packages/ui/primitives
# ou
pnpm ui:add sidebar --yes
```

O registry do shadcn importa `from "cn"`. Neste monorepo isso é o pacote workspace `packages/ui/cn`, não o npm público. O `.npmrc` aponta `store-dir` para `.pnpm-store` do repo — senão o `pnpm add` do CLI usa o store global e quebra.

Tema: `src/styles.css` — Tailwind 4 (`@theme inline` + `:root` / `.dark`). Apps só importam o CSS.

