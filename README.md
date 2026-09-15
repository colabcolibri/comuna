# Comuna

A small open-source platform for member spaces that stay out of your pocket.

Not a social network. Not a feed. Not another place that pings you until you come back. Comuna is for people who already have a project — a cohort, an alumni year, a practice, an incubator — and need a house for it: members, a public face, a way to write to someone without handing over their inbox.

The name is on purpose. A *comuna* is a shared place with a door. You choose when to walk in.

## Why it exists

Every project eventually hits the same wall. Spreadsheets for the roster. WhatsApp for everything else. Then a “community” product that arrives with chat, stories, badges, and a profile that wants your whole life.

The needs underneath that mess are quieter:

- **Spaces that do not leak.** Project A, project B, and project C are different rooms. They keep their own people, their own fields, their own tone. Isolation is the point.
- **People over time.** A group that is happening now, and a group that already happened, both deserve a roster that still makes sense.
- **A window, not a megaphone.** The network can be visible to the world. Contact can be possible. An email address does not have to be the price of showing up.
- **A map of consent.** Where people are, what they share, what stays inside — field by field, person by person.
- **Software you visit.** A forum, if it ever exists here, should work like the old web: you go there, you read, you leave. It does not sit in your notifications deciding that now is the time.

Some things want to be shared across rooms later — a simple course that several cohorts can pick up or drop, a time bank where offering and asking is a gift of hours, not a product. Those are not the core. They are guests. The core has to stay small enough that adding them does not turn the house into an amusement park.

Comuna borrows the mood of WordPress and Moodle: a stubborn centre, and modules you switch on when a space actually needs them. Expand the edges. Do not fatten the middle.

This is software for people who still believe a network can be a practice, not an audience. It will not save anything. It might help a few rooms stay kinder than the default.

## What runs today

Two Next.js apps, one Postgres, plugins that are off until a community turns them on.

| App | Who | Local |
| --- | --- | ----- |
| [apps/web](apps/web) | Members, guests, coordinators | [http://localhost:3014](http://localhost:3014) |
| [apps/admin](apps/admin) | Super-admin | [http://localhost:3015](http://localhost:3015) |

**In the core:** email OTP, a person, a community (tenant), membership, join requests, cohorts, a base profile.

**As modules, per space:** a richer directory and field catalog, a public showcase, mediated contact (the message is delivered; the address is not).

Locales: `pt-BR` (default) and `en`.

**Not in this cut — and not coming in as chat:** a course catalog shared across tenants, an internal map, a forum, a time bank, payments, OAuth, native apps. If they land, they land as modules. The core does not grow a timeline to make room for them.

## Quick start

Node.js 20+, [pnpm](https://pnpm.io) 11, Docker Desktop.

```bash
docker compose up -d
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

In another terminal:

```bash
pnpm dev:admin
```

OTP for local login lands in [Mailpit](http://localhost:8026), not in the API JSON. Ops seed: `INITIAL_SUPER_ADMIN_EMAIL`. Postgres is on `localhost:5433`.

Env contract: [docs/08_environments.md](docs/08_environments.md). Do not commit `.env`.

```bash
pnpm test
```

## Layout

```txt
apps/web             member app
apps/admin           ops app
packages/core        auth, mail, identity, db, tenants
packages/modules     directory, showcase, contact-mediated
packages/ui          shadcn primitives + composed templates
db/migrations        dated SQL (no Prisma)
docs/                product contract
```

Workspace packages are `@community/*`. The public repo is [colabcolibri/comuna](https://github.com/colabcolibri/comuna).

## Documentation

The README is the front door. The house rules live in `docs/`.

| | |
| --- | --- |
| [Scope](docs/00_scope.md) | What the product is |
| [Architecture](docs/05_architecture.md) | Apps, packages, plugin gate |
| [Database](docs/06_database.md) | Schema |
| [API](docs/07_api_contracts.md) | HTTP |
| [Environments](docs/08_environments.md) | Local run, SMTP |
| [Design](docs/09_design_system.md) | UI |
| [Index](docs/README.md) | Full list |
