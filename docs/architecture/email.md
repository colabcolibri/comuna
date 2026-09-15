---
title: Transactional email
updated: 2026-09-15
source: docs/05_architecture.md
---

# Transactional email

Volta: `docs/05_architecture.md` § Auth e § Operations (admin app). Visual: `docs/09_design_system.md` § Email.

SMTP envia. O conteúdo não vive nas rotas Next. Um pacote de domínio monta HTML + texto; as apps só pedem o envio.

## Template

Há **um** template HTML (`packages/core/mail/src/layout.ts`) para todos os kinds. Tabela de **600px**, fundo `background`, cartão `surface`, tipografia IBM Plex Sans (Helvetica/Arial no fallback), título e corpo centrados. CTA `primary`, acento `mark` no recado. Sem JavaScript. Estilos **inline**. Logo opcional (`logo_url`); sem logo, o nome do produto. Rodapé: produto + URL de suporte. Versão texto puro obrigatória.

O template **não** é editável por comunidade nem por kind. Comunidade só entra como variável (`community_name`) no texto de kinds que precisam.

`contact_notice`: From continua da plataforma. **Reply-To** = `sender_name` + `sender_email` de quem escreveu. Responder no cliente de e-mail vai para essa pessoa. Não forjar o From com o e-mail do visitante (quebra SPF/DMARC). Sem `sender_email` válido, o aviso segue sem Reply-To.

## Slots (layout, não overlay)

| Slot | Kinds | O que o template insere |
| ---- | ----- | ----------------------- |
| `otp` | `member_otp`, `ops_otp` | Cartão com `{{code}}` |
| `cta` | `person_invite` | Botão Entrar + `{{login_url}}` |
| `quote` | `contact_notice` | Remetente + `{{message}}` |

Ops não cola HTML nesses blocos.

## Copy (o que o admin edita)

Por kind e locale: `subject`, `heading`, `body` (texto simples, `{{var}}` no texto). O renderer joga isso nos buracos do template.

Defaults: `packages/core/mail/src/copy.ts`. Overlay: `ops_core.email_templates`. `html_body` / `text_body` são snapshot gerado na gravação, não fonte. Ausência de row (ou heading+body vazios) = default. Reset apaga o overlay.

## Kinds (catálogo fechado)

| Kind | Quem recebe | Variáveis no texto | Slot | Quando |
| ---- | ----------- | ------------------ | ---- | ------ |
| `member_otp` | e-mail pedido na web | `product_name`, `support_url` | `otp` (`code`) | `POST /api/auth/request-otp` |
| `ops_otp` | e-mail pedido no admin | `product_name`, `support_url` | `otp` (`code`) | `POST /api/admin/auth/request-otp` |
| `person_invite` | pessoa criada no admin | `product_name`, `support_url` | `cta` (`login_url`) | `POST /api/admin/people` |
| `contact_notice` | coordenação / caixa da comunidade | `product_name`, `community_name` | `quote` (`sender_name`, `sender_email`, `message`) | contato mediado |

Não há kind livre nesta versão.

## Interpolation

Placeholders `{{name}}` no copy. Sem lógica, sem loops. Catálogo em `KIND_VARIABLES` / `KIND_SLOT`. Variáveis no HTML são escaped. `code` só dígitos.

Preview no admin: o mesmo `composeMail` (`@community/mail/compose`) com o copy default já nos campos. Kinds em `OpsTabs` horizontais (não Select). Iframe estável (`OpsHtmlPreview`): troca o DOM interno, não o `srcDoc` a cada tecla. Sem SMTP.

## Transporte

Um cliente SMTP (`nodemailer` em `@community/auth`), não um handshake TCP feito à mão. SRP: `smtp-config.ts` lê env; `smtp-headers.ts` monta Reply-To; `smtp.ts` envia.

Baseline local: Mailpit (`SMTP_HOST=localhost`, `SMTP_PORT=1026`, sem AUTH, `SMTP_SECURE=none` — default da porta 1026). UI: `http://localhost:8026`.

Produção / staging: o mesmo transporte, com `SMTP_USER` / `SMTP_PASS` e TLS. Heurística se `SMTP_SECURE` omisso: 465 → `tls`, 587 → `starttls`, resto → `none`. Override explícito: `none` | `starttls` | `tls`.

`sendKindEmail` é o único gate: sem `SMTP_HOST` não envia (rotas não rechecam env). Com host, AUTH/TLS vêm da config. From: plataforma (`from_address`) com fallback `EMAIL_FROM_ADDRESS`. `contact_notice` preenche Reply-To com o visitante; MAIL FROM continua da plataforma.

Segredo (`SMTP_PASS`) só em env. `GET /api/admin/platform` devolve `smtp` só com host, porta, modo TLS e se há usuário — nunca senha. Admin não grava SMTP em `platform_settings`.

## Fora deste contrato

Editor visual drag-and-drop, MJML CLI, template distinto por kind, provedor de produção (Resend/SES) além de SMTP, tradução jurídica, marketing/newsletters, MFA.
