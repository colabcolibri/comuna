# Comuna

A home for a group that already exists.

A cohort, an alumni year, a practice, an incubator, a mentoring circle — people who already share a life, and need more than a spreadsheet and a chat thread to be that group in public and in private. Not a social network. Not a feed. Not a machine that measures how alive you are by how often you talk.

Comuna is named on purpose. A *comuna* is a shared place with a door. You choose when to walk in. The software is in service of the people in the room, not the other way around.

## The core

Most community software is built to make people speak more. Unread badges, streaks, a thousand small exchanges as proof the network is “working.” That is a real product. It is not this one.

Comuna’s bet is the opposite: **the group is the product.** Conversation can happen. Volume is not the prize. Showing up on purpose is.

The core stays small so the house does not become a mall.

**A person.** Someone with a name, a place, a way to sign in. Enough to exist without filling a marketing form.

**A community.** A tenant with its own people, its own tone, its own door. Group A and group B do not leak into each other. Isolation is the point, not a side effect.

**A membership.** You ask to enter. Someone who holds that room says yes or no. An alumni year, a cohort, a practice — those are kinds of community, not the name of the platform.

**A base profile.** The minimum the group needs to recognise you. Extra fields, maps, a public window, a way to write without handing over an inbox — those are modules the community turns on. They are guests. They do not fatten the middle.

Around that: consent as a map, not a banner. What the world can see, what stays inside, what another person may ask — field by field, person by person. Contact can be possible without an email address as the price of showing up.

This is software you visit. You come in, you use the tool the group needed, you leave. If a forum ever lives here, it should work like the old web: you go there, you read, you go. It does not sit in your notifications deciding that now is the time.

Expand the edges. Do not fatten the middle. A course several cohorts can pick up, a time bank of hours given rather than sold — those can wait at the door. They land as modules or they do not land. The core does not grow a timeline to make room for them.

This will not save anything. It might help a few rooms stay more intentional than the default.

## What ships

Two Next.js apps, one Postgres. Default locale `pt-BR`, also `en`.

| App | Who | Local |
| --- | --- | --- |
| [apps/web](apps/web) | Guests, members, coordinators | [http://localhost:3014](http://localhost:3014) |
| [apps/admin](apps/admin) | Super-admin (ops) | [http://localhost:3015](http://localhost:3015) |

Public repo: [colabcolibri/comuna](https://github.com/colabcolibri/comuna). Workspace packages: `@community/*`.

**In the core today:** email OTP, a person, a community, membership, join requests, cohorts, a base profile (city via OpenStreetMap). Members edit their own profile. Coordinators work the join queue at `/c/{slug}/coord/approvals`.

**On the ops app:** communities, people, members, cohorts, field catalogs, lists, mail, platform settings, and the module board — enable or disable per community.

**Not in this cut, and not arriving as chat:** a shared course catalog, an internal forum, a time bank, payments, OAuth, native apps. If they land, they land as modules.

## Modules

A new community is flags, not a fork. With a module off, its routes and APIs 404/403. Extra fields do not leak.

| Slug | Package | What it is |
| --- | --- | --- |
| `directory` | `packages/modules/directory` | Field catalog, search, lists |
| `showcase` | `packages/modules/showcase` | Public window onto the group |
| `contact-mediated` | `packages/modules/contact-mediated` | The message is delivered; the address is not |
| `map` | `packages/modules/map` | Map view on lists (off by default) |

## Run it locally

Node.js 20+, [pnpm](https://pnpm.io) 11, Docker Desktop (Postgres + Mailpit).

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

Read-only demo of both apps (they can run together):

```bash
pnpm dev:demo
pnpm dev:admin:demo
```

Local OTP lands in [Mailpit](http://localhost:8026), not in the API JSON. Ops seed: `INITIAL_SUPER_ADMIN_EMAIL`. Postgres is on `localhost:5433`. Env contract: [docs/08_environments.md](docs/08_environments.md). Do not commit `.env`.

Install from the workspace root. Do not run `next` at the repo root.

```bash
pnpm test
```

## Layout

```txt
apps/web             member app
apps/admin           ops app
packages/core        auth, mail, identity, db, tenants, module runtime
packages/modules     directory, showcase, contact-mediated, map
packages/ui          shadcn primitives + member/admin composites
db/migrations        dated SQL (no Prisma)
docs/                product contract
```

## Documentation

The README is the front door. The house rules live in `docs/`.

| | |
| --- | --- |
| [Scope](docs/00_scope.md) | What the product is |
| [Architecture](docs/05_architecture.md) | Apps, packages, plugin gate |
| [Database](docs/06_database.md) | Schema |
| [API](docs/07_api_contracts.md) | HTTP |
| [Environments](docs/08_environments.md) | Local, SMTP, deploy |
| [Design](docs/09_design_system.md) | UI |
| [Index](docs/README.md) | Full list |
