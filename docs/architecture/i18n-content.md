---
title: i18n CONTENT convention
updated: 2026-09-14
source: docs/09_design_system.md
---

# i18n — CONTENT at file top

Volta: `docs/09_design_system.md` § Internationalization.

## Rule

Todo arquivo que renderiza UI (página, composto, e-mail template TSX) declara no **topo**, depois dos imports de tipo se preciso, **antes** do componente:

```ts
const CONTENT = {
  'pt-BR': {
    title: 'Entrar',
    submit: 'Enviar código',
  },
  en: {
    title: 'Sign in',
    submit: 'Send code',
  },
} as const
```

O componente resolve `CONTENT[locale]` (helper `pickContent(CONTENT, locale)` em `packages/core` ou `packages/ui`). **Proibido:** literal em JSX (`<h1>Diretório</h1>`), dump central `translations.ts` como fonte, chave mágica espalhada sem o objeto no arquivo.

## Locales

| Tag | Role |
| --- | ---- |
| `pt-BR` | Default e fallback |
| `en` | Segunda língua |

RTL: `_n/a_` nesta versão.

## What stays out of CONTENT

- `className`, tokens, slugs, IDs.
- Logs de servidor (não são UI).
- Códigos de erro de API (`INVALID_OTP`) — mensagem humana pode viver no handler com `CONTENT` no topo do route se o JSON `message` for visível.

## Emails

Mesma regra no arquivo que monta o HTML do e-mail.

## Legacy

`src/lib/i18n/translations.ts` é dívida. US de i18n apaga o dump e converte telas para `CONTENT`.
