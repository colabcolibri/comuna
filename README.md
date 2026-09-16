# Comuna

A simple, modular platform that holds a mirror up to a community — and gives that community a motor.

A cohort, an alumni year, a practice, an incubator, a mentoring circle: people who already share a life. Comuna is the place where that life can be seen, entered, and set in motion. Not a social network. Not an infinite chat with a channel for every topic and a thread for every aside. Talk can exist later, as a module, if a group wants it. The centre of the product is something else: **a working likeness of the community itself.**

Comuna is named on purpose. A *comuna* is a shared place with a door. You choose when to walk in. The software serves the people in the room.

## The core

The job is not to keep everyone typing. The job is to dynamize the life of a group that already exists.

That looks like a roster that still makes sense years later. Like finding each other without ransoming an inbox. Like a public face the world can look at, without turning members into a megaphone. Like room to learn together, to go deeper in the exchanges that matter, to become less of a list and more of a community.

The platform is built **modular** so each community can turn on only the facets it actually lives. A directory. A showcase. Mediated contact. A map. Later, perhaps a course, a forum, a time bank. Guests at the door — never a reason to fatten the middle into Slack-with-a-directory.

Under every module, the same small core:

**A person.** A name, a place, a way in. Enough to exist.

**A community.** A tenant with its own people, its own tone, its own door. Rooms do not leak. Isolation is the point.

**A membership.** You ask. Someone who holds that room says yes or no. Alumni, cohort, practice — kinds of community, not the name of the product.

**A base profile.** The minimum the group needs to recognise you. Extra fields and extra tools are modules that community switches on.

Around that: consent as a map, not a banner. What the world sees, what stays inside, what another person may ask — field by field. You visit the software, use the tool the group needed, and leave. Nothing sits in your notifications deciding that now is the time.

This will not invent a community that is not there. It can give one that is there a clearer reflection, and a way to move.

## What ships

Two Next.js apps, one Postgres. Default locale `pt-BR`, also `en`.

| App | Who | Local |
| --- | --- | --- |
| [apps/web](apps/web) | Guests, members, coordinators | [http://localhost:3014](http://localhost:3014) |
| [apps/admin](apps/admin) | Super-admin (ops) | [http://localhost:3015](http://localhost:3015) |

Public repo: [colabcolibri/comuna](https://github.com/colabcolibri/comuna). Workspace packages: `@community/*`.

**In the core today:** email OTP, a person, a community, membership, join requests, cohorts, a base profile (city via OpenStreetMap). Members edit their own profile. Coordinators work the join queue at `/c/{slug}/coord/approvals`.

**On the ops app:** communities, people, members, cohorts, field catalogs, lists, mail, platform settings, and the module board — enable or disable per community.

**Not in this cut:** a shared course catalog, a forum of channels and threads, a time bank, payments, OAuth, native apps. If they land, they land as modules — they do not become the product.

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
