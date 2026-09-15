---
title: Transactional email
updated: 2026-09-15
source: docs/05_architecture.md
---

# Transactional email

Volta: `docs/05_architecture.md` § Auth e § Operations (admin app). Visual: `docs/09_design_system.md` § Email.

SMTP envia. O conteúdo não vive nas rotas Next. Um pacote de domínio monta HTML + texto; as apps só pedem o envio.

## Envelope

Um único envelope (como o template de Auth do Supabase): tabela HTML de **600px**, fundo `background`, cartão `surface`, texto `foreground`, CTA/`mark` só no código OTP. Sem JavaScript. Estilos **inline**. Logo opcional (`logo_url` da plataforma). Rodapé: nome do produto + URL de suporte. Versão texto puro obrigatória (clientes sem HTML).

O envelope **não** é editável por comunidade. Comunidade só entra como variável (`community_name`) no corpo de kinds que precisam.

## Kinds (catálogo fechado)

| Kind | Quem recebe | Variáveis | Quando |
| ---- | ----------- | --------- | ------ |
| `member_otp` | e-mail pedido na web | `code`, `product_name`, `support_url` | `POST /api/auth/request-otp` |
| `ops_otp` | e-mail pedido no admin | `code`, `product_name`, `support_url` | `POST /api/admin/auth/request-otp` |
| `person_invite` | pessoa criada no admin | `product_name`, `support_url`, `login_url` | `POST /api/admin/people` |
| `contact_notice` | coordenação / caixa da comunidade | `product_name`, `community_name`, `sender_name`, `sender_email`, `message` | contato mediado |

Não há kind livre nesta versão. Overlay no admin edita subject / html / text **por kind e locale**, não inventa kind.

## Interpolation

Placeholders `{{name}}` (mesmo estilo do pack i18n). Sem lógica, sem loops. O renderer recusa HTML injetado nas variáveis (escape). `code` só dígitos.

## Defaults vs overlay

Defaults: pack `core_mail` (`packages/core/mail/src/lang.ts`) — pt-BR e en. Overlay: `ops_core.email_templates` (`kind`, `locale`, `subject`, `html_body`, `text_body`). Ausência de row = default. Reset no admin apaga o overlay.

Preview no admin: o mesmo `renderEmail` com dados de exemplo. Sem enviar SMTP no preview.

## Transporte

`sendSmtpMail` em `@community/auth` (ou reexport do mailer) aceita `html` + `text`, `From: "Nome" <addr>`. Host/porta continuam env (`SMTP_*`). Endereço From: plataforma (`from_address`) com fallback `EMAIL_FROM_ADDRESS`. Sem SMTP configurado: não inventar sucesso silencioso se o produto exige envio; local com Mailpit.

## Fora deste contrato

Editor visual drag-and-drop, MJML CLI, provedor de produção (Resend/SES) além de SMTP, tradução jurídica, marketing/newsletters, MFA.
