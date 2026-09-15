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

O componente resolve `CONTENT[locale]` com `pickContent` de `@community/identity`. **Proibido:** literal em JSX (`<h1>Diretório</h1>`), dump central de traduções.

## Locales

| Tag | Role |
| --- | ---- |
| `pt-BR` | Default e fallback |
| `en` | Segunda língua |

RTL: `_n/a_` nesta versão.

## What stays out of CONTENT

- `className`, tokens, slugs, IDs.
- Logs de servidor (não são UI).
- Dados de membro **não** são `CONTENT`. Headline/bio: LocalizedText preenchido. Cidade: objeto geocodificado; o rótulo vem do Nominatim e a UI só escolhe `placeLabel` com o locale da chrome.

## Emails

Mesma regra no arquivo que monta o HTML do e-mail.

## Legacy

Dump `translations.ts` / `I18nContext` foi removido. Chrome usa `CONTENT` + `pickContent`.
