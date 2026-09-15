---
title: Person media (avatar)
updated: 2026-09-15
source: docs/05_architecture.md
---

# Person media

Volta: `docs/05_architecture.md` § Identity.

Avatar é **núcleo** (`person_core`). Não é plugin. Não vive em `plugin_directory`. Não vai para `custom_attributes`. Não vai para `apps/web/public/` (deploy apaga).

## O que o Postgres guarda

`profiles.avatar_url` continua sendo um **ponteiro público** (URL que o browser pede). **Não** é o arquivo. Sem `bytea`.

URL estável da app, não signed URL de 15 minutos:

`{NEXT_PUBLIC_APP_URL}/api/media/person/{user_id}/avatar`

O GET resolve a chave no store. Trocar o ficheiro **não** muda a URL (cache via `ETag` / `Cache-Control`).

## Chave no store (igual em disco e S3)

```txt
person/{user_id}/avatar.webp
```

Uma foto atual por pessoa. Upload novo **substitui**. Pessoa é global: **não** prefixar `community_id`.

Logo de comunidade (depois): `community/{community_id}/logo.webp` no **mesmo** store.

## Pasta local

Raiz do monorepo, **gitignored**:

```txt
storage/person/{user_id}/avatar.webp
```

`MEDIA_ROOT` aponta para essa pasta (default `storage`). Nunca `public/`. Nunca `packages/`.

Produção: o mesmo layout de chaves num bucket S3-compatível (R2, MinIO, S3). Adapter troca; a chave não.

## Pacote

`packages/core/files` — porta `ObjectStore` (`put`, `get`, `delete`). Identity chama o store. Directory/showcase só **mostram** `avatar_url`.

Adapters: `local` (fs) e `s3`. A app escolhe por env. Sem `if (prod)` nas páginas.

## Fluxo

1. Membro autenticado `POST /api/profiles/me/avatar` (multipart). Não grava URL solta de internet no campo.
2. Servidor: magic bytes jpeg/png/webp; teto ~2 MB; recorte/resize quadrado (ex. 512). **Sem SVG** (XSS).
3. `put` na chave acima; `UPDATE person_core.profiles.avatar_url`.
4. UI: tipo de campo `image` no catálogo (não `url` cru). `FieldControl` faz o POST e guarda o URL devolvido no estado; salvar o perfil-base não reenvia o binário.

Apagar conta / titular LGPD: `delete` da chave + `avatar_url = null`.

## O que recusar

| Tentação | Porquê não |
| --- | --- |
| `public/avatars` | Ephemeral, sem auth no ficheiro cru |
| Pasta por comunidade | Identidade não é tenant |
| Coluna bytea | Backup e RLS inchados |
| URL arbitrária no PUT perfil | Hotlink e XSS |
| Plugin “media” só para avatar | Foto é perfil-base |

## Segurança

Upload só com sessão. GET público se o perfil (ou vitrine) pode mostrar a foto; senão 404. MIME pelo conteúdo, não pelo nome do ficheiro. Detalhe de ameaça: `docs/02_security.md`.
