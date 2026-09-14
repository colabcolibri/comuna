# DESIGN.md — Alumni Platform

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
- Skip-to-content implied in header. Landmark regions: header, nav, main, complementary filters, footer.
- Body copy ≥ 16px. Line-height ≥ 1.5. Max line length ~65ch on reading surfaces.
- Error text adjacent to the field, in words, plus icon.
- Privacy states must be readable by screen readers (not icon-only locks).

## Colors

Light default. Dark is a later user preference, not the hero.

- Canvas: #f8fafc
- Surface / cards: #ffffff
- Text: #0f172a
- Muted text: #475569 (not #94a3b8 — too light for AA)
- Border: #e2e8f0
- Primary CTA: #0f172a on white text
- Destructive: #b91c1c on light tint #fef2f2 (not neon red)
- Available: text + small filled square or text chip, not a lone green dot

One solid primary CTA per view. Secondary actions are outline or ghost.

## Typography

- Headlines: Inter, semibold, tight tracking (-0.02em on large titles)
- Body / long read: Atkinson Hyperlegible Next, 16–18px
- Labels / chips: Inter 14px medium
- No decorative serif. No all-caps paragraphs. Chips may be sentence case, never shouty uppercase walls.

## Layout

Desktop: 12-column, max content 1120px. Filters as a quiet left rail (240px) on directory only — not a Circle spaces sidebar.

Tablet: 2-column cards, filters collapse to a Filter button + sheet.

Mobile: 1 column, compact nav (Vitrine, Entrar). Hamburger only if 4+ destinations.

Generous whitespace. Cards: 1px border, almost no shadow (0 1px 2px rgba(15,23,42,0.04)).

Radius 8px controls, 12px cards.

## Components

**Header:** wordmark “Alumni” left. Nav: Vitrine, Entrar. Logged in: Diretório, Meu perfil, (Coordenação if role). No notification bell.

**Profile card:** photo or initials, name, one-line role, 3 skill chips max, availability chip with text, “Ver perfil”.

**Profile page:** identity, skills, current projects, availability, privacy note (“contato só pela plataforma”). CTA “Solicitar contato”.

**Contact modal:** name, message, submit. Explains mediation. No email of alumni shown to guests.

**OTP:** email, then 6-digit code fields with large targets. Helper text. Resend.

**Moderation table:** name, turma, date, Approve / Reject as explicit buttons with labels.

## Empty / error

Empty directory: “Nenhum perfil público corresponde aos filtros.” + clear filters.

OTP error: “Código inválido ou expirado. Solicite outro.”

## Copy

Portuguese (Brazil). Sentence case. Short. No marketing fluff. No “comunidade vibrante”. Prefer “Encontre pessoas da rede”.
