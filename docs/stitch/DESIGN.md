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
- Body copy ≥ 16px. Line-height ≥ 1.5. Max line length ~65ch on reading surfaces.
- Error text adjacent to the field, in words, plus icon.
- Privacy states must be readable by screen readers (not icon-only locks).

## Colors

Light default.

- Canvas: `#f8fafc`
- Surface / cards: `#ffffff`
- Text: `#0f172a`
- Muted text: `#475569`
- Border: `#e2e8f0`
- Primary CTA: `#0f172a` on white text
- Destructive: `#b91c1c` on `#fef2f2`

One solid primary CTA per view. Secondary actions are outline or ghost.

## Typography

- Headlines: Inter, semibold
- Body: Atkinson Hyperlegible Next, 16–18px
- Labels / chips: Inter 14px medium
