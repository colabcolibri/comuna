# DESIGN.md — Alumni Platform (Stitch)

Cópia de referência do brief do projeto `9675775750351043893`.

## Product

Web app for alumni networks: talent directory, project collaboration, mediated hiring. Not a social community. Not Circle.

Language: Brazilian Portuguese. Tone: calm, precise, institutional without being bureaucratic.

## Positioning vs Circle

Circle is feed-first, space-heavy, chatty, colorful chrome, many sidebars and unread badges.

Alumni is **directory-first**, **privacy-first**, **one job per screen**.

Do not design: activity feeds, spaces list, emoji reactions, comment threads, gamification, unread dots everywhere, rainbow badges, stacked community widgets.

Do design: search people, read a profile, request contact, sign in with email code, moderate membership. Silence is a feature.

## Brand personality

Accessible. Professional. Simple. Minimalist. Trustworthy.

Think Linear + Apple Jobs + a university alumni office — not Discord, not Circle, not LinkedIn noise.

## Accessibility (non-negotiable)

- WCAG 2.2 AA minimum. Prefer AAA on body text.
- Text vs background contrast ≥ 4.5:1 (body), ≥ 3:1 (large text and UI chrome).
- Focus: 2px offset ring, primary color, never outline:none without replacement.
- Hit targets ≥ 44×44px. Form labels always visible (never placeholder-only).
- Do not use color alone for status. Pair with text: Disponível / Mentoria / Fechado.
- Reduced motion: no auto-playing carousels, no parallax, no decorative animation required to understand state.
- Skip-to-content implied in header. Landmark regions: header, nav (in sheet), main, complementary filters, footer.
- Body copy ≥ 16px. Line-height ≥ 1.5. Max line length ~65ch on reading surfaces.
- Error text adjacent to the field, in words, plus icon.
- Privacy states must be readable by screen readers (not icon-only locks).

## Colors

Light default. Dark is a user preference (toggle in header), not the hero.

Warm paper, not cold slate:

- Canvas: `#f3f0ea`
- Surface: `#fffcf7`
- Text: `#1c1915`
- Muted: `#5c564e`
- Border: `#ddd6cc`
- Primary CTA: `#1f3d38` on `#f7f6f2`
- Mark (Vitrine underline + focus only): `#c45c26`
- Destructive: `#b91c1c` on `#fef2f2`

Do **not** use Tailwind slate-50 / #0f172a as the brand. Do **not** paint large regions with the copper mark.

## Page header template (every content screen)

Not a lonely h1. Structure:

1. Kicker (13–14px, pine `#1f3d38`, sentence case): e.g. Membros, Público, Coordenação, Conta
2. Row: **title** (IBM Plex 28–32px semibold) + optional actions on the right (filter, primary)
3. Lede (18px, muted, max ~40rem)
4. 1px rule, then content

## People index (vitrine + directory)

**Rows, not a card grid.** Each row: 44px initials disc, name, headline, availability text chip, one action. 1px dividers on a single surface. Search is a labeled field under the page header, not a floating hero.

Forbidden: bento, 3-column talent cards, decorative empty filters rail, Inter, Atkinson, cyan Community navbar.

## Typography

One family for UI. **IBM Plex Sans** for headlines, body, and labels.

- Headlines: IBM Plex Sans, semibold, tight tracking (−0.02em on large titles), 32 / 24 / 20
- Body: IBM Plex Sans, 16–18px, weight 400, line-height 1.5–1.6
- Labels / chips: IBM Plex Sans 14px medium
- Do not use Atkinson Hyperlegible (2019) — distinctive letterforms, not institutional, poor “decent system” look
- Do not use Inter as the product face — overused and currently mixed incorrectly in code
- No decorative serif. No all-caps paragraphs. Chips sentence case.

## Chrome (global — every member/visitor screen)

This is the product shell. Every screen except `/ops` uses it. Do **not** invent a second navbar.

### Top bar (always)

Height 64px. White surface. 1px bottom border. Max content 1120px, 24px gutter.

Left to right:

1. **Menu trigger** — icon button 44×44, hamburger, `aria-label` “Abrir menu”. Opens a **left Sheet** (shadcn Sheet, side=left). Not a permanent sidebar.
2. Wordmark **Alumni** (semibold). Not a dump of links.
3. **Only one destination in the header:** text link **Vitrine** (`/showcase`). Active: 2px underline in primary. No Diretório, Perfil, Pedidos, Entrar, e-mail, or Sair in the top bar.

Right cluster (always):

- Locale control: `pt-BR` | `en` (visible labels, 44px hit)
- Light / dark toggle (icon + accessible name)

Nothing else in the header. No notification bell. No e-mail string. No “Voltar para a vitrine” duplicate.

### Left sheet (shadcn)

Width ~360px desktop, full-bleed mobile. Overlay + panel. Close on overlay, Escape, and X.

Structure, top to bottom:

1. Sheet header: title “Menu” + close
2. Nav list (one job per row, 44px rows):
   - Visitante: Entrar
   - Membro: Diretório, Meu perfil
   - Coordenador: + Pedidos de entrada
3. Spacer (flex grow)
4. **Profile dock at the bottom** (always present):
   - Visitante: avatar placeholder, “Visitante”, CTA “Entrar com e-mail”
   - Membro: avatar or initials, **nome**, headline one line, e-mail muted, links “Editar perfil” and “Sair”

The profile block is **below** the nav, pinned to the sheet footer. It is not in the top bar.

## Layout

Desktop: 12-column, max content 1120px. Filters as a quiet left rail (240px) on directory only — not a Circle spaces sidebar. Filters never live in the global sheet.

Tablet: 2-column cards, filters collapse to a Filter button + **second** sheet (filters only). Do not mix filters with account nav.

Mobile: 1 column. Header = menu + Vitrine + locale + theme. Hamburger is mandatory because destinations live in the sheet.

Generous whitespace. Cards: 1px border, almost no shadow (0 1px 2px rgba(15,23,42,0.04)).

Radius 8px controls, 12px cards.

## Components

**Profile card (vitrine / directory):** photo or initials, name, one-line role, 3 skill chips max, availability chip with text, “Ver perfil”.

**Profile page (public):** identity, skills, current projects, availability, privacy note (“contato só pela plataforma”). CTA “Solicitar contato”.

**Contact:** dialog or right sheet. Name, message, submit. Explains mediation. No alumni e-mail shown to guests.

**OTP:** email, then 6-digit code fields with large targets. Helper text. Resend. Same slim header (Vitrine + locale + theme). No second brand bar.

**Moderation table:** name, turma, date, Approve / Reject as explicit buttons with labels.

**Meu perfil (edit):** stacked form, labels always visible, one primary Salvar.

## Empty / error

Empty directory: “Nenhum perfil público corresponde aos filtros.” + clear filters.

OTP error: “Código inválido ou expirado. Solicite outro.”

## Copy

Portuguese (Brazil). Sentence case. Short. No marketing fluff. No “comunidade vibrante”. Prefer “Encontre pessoas da rede”.
