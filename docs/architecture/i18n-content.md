---
title: i18n chrome catalog
updated: 2026-09-15
source: docs/09_design_system.md
---

# i18n — packs + CONTENT no arquivo

Volta: `docs/09_design_system.md` § Internationalization.

Não usamos next-intl. O contrato cobre o mesmo que importa: namespace por componente, fallback `pt-BR`, interpolação `{name}`, e gancho de overlay. ICU/plural e editor de overlay ainda não.

## Rule

1. **Pack** = fonte da string (`apps/web/src/lang/*.ts` ou `packages/modules/<slug>/src/lang.ts`).
2. **Arquivo de UI** declara `CONTENT` no topo com as chaves **locais** (`showcase`, `closeMenu`) apontando para ids do pack.
3. **JSX** só usa `copy.showcase`. Proibido literal visível.

```ts
const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  showcase: 'chrome.showcase',
  closeMenu: 'chrome.close_menu',
})
const copy = pickContent(CONTENT, locale)
```

Tela que mistura núcleo e plugin: `mergeContent(...)`.

## Catalog (compile-time)

`apps/web/src/lang/catalog.ts` registra:

| Component | Pack | Dono |
| --------- | ---- | ---- |
| `core_web` | `apps/web/src/lang/core_web.ts` | chrome, home, login, otp, cidade, e-mail OTP, meta |
| `core_identity` | `apps/web/src/lang/core_identity.ts` | labels do perfil-base |
| `core_membership` | `apps/web/src/lang/core_membership.ts` | coordenação |
| `core_admin` | `apps/web/src/lang/core_admin.ts` | ops na web |
| `plugin_directory` | `packages/modules/directory/src/lang.ts` | diretório + card |
| `plugin_showcase` | `packages/modules/showcase/src/lang.ts` | vitrine |
| `plugin_contact_mediated` | `packages/modules/contact-mediated/src/lang.ts` | formulário de contato |

Resolver: `createUiCatalog` em `@community/identity`. Overlay (SQL por `community_id`) está na porta; ainda não há tabela.

## Locales

| Tag | Role |
| --- | ---- |
| `pt-BR` | Default e fallback |
| `en` | Segunda língua |

RTL: `_n/a_` nesta versão.

## What stays out of chrome packs

- `className`, tokens, slugs, IDs.
- Logs de servidor.
- Headline/bio (LocalizedText) e cidade (GeoPlace).
- **API `error.code`:** o cliente mapeia o código; `message` em JSON é fallback pt-BR para curl, não é o catálogo da UI.

## Inventory (web membro)

Coberto: sidebar, shell, footer, locale, tema (via props do shell), home, login, otp card, busca de cidade, perfil, diretório, vitrine, contato, coord, ops, metadata, e-mail OTP.

Ainda fora:

| Superfície | Estado |
| ---------- | ------ |
| `apps/admin` | login OTP, comunidades, módulos, coordenador (`CONTENT` + pack `core_admin`) |
| Overlay por comunidade | porta pronta, sem SQL/UI |
| Mensagens de API na UI | cliente ainda mostra `error.message` do servidor (pt-BR) |
| ICU / plural | interpolação `{name}` só |
| `ThemeToggle` | labels vêm do `CONTENT` do shell (ok: primitivo sem pack) |

## Emails

Template no pack `core_web` (`email.otp.*`). Locale do cookie `ui_locale`.
