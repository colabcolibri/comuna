# Comuna

The name is ordinary Portuguese: a *comuna* is a place people share. The software is for a group that already exists — a class, an alumni year, a practice — and needs somewhere to be that group, rather than another feed.

It is meant for the people who already hold those groups: an alumni office, a school, an incubator. They usually keep more than one group, often in spreadsheets. On Comuna you run a single installation and create as many **spaces** as you need. Each space is one group, with its own members and its own modules.

## Chat tools do a different job

Products such as Circle, Discord, Slack and Mighty Networks are built around an ongoing conversation: feeds, channels, threads, unread counts. Comuna is built around who belongs to the group and how that group can be seen. A forum or chat could be added later as a module; that is not what this product is for, and the two kinds of tool can sit side by side.

## A space

A space starts with people, membership and a basic profile. Someone asks to join; a coordinator of that space accepts or refuses. Members edit their own profile. People from one space do not show up in another.

Someone can still belong to several spaces. The 2019 alumni year and the incubator can sit on the same install; a person who is in both switches space and keeps a different profile in each, looking at one space at a time.

The first thing in a space is a list of the people who belong there. If someone wants to reach a member, they fill in a short form on that person’s card. Comuna sends the message to the member by email; the address itself never appears on the page. Each member chooses whether they accept those messages at all — including saying no.

The same space can publish a public page, so someone who is not logged in can still see who opted to appear. What is visible on a profile is decided in that space, field by field. A visitor opens `/showcase` with no account: one public page, or a list if several spaces are public. The directory stays behind membership.

If a module is off in a space, that feature is simply not there: the page does not open, and extra profile fields from that module do not appear in another space.

| Module | What the space gets |
| --- | --- |
| `directory` | Lists, extra fields, search |
| `showcase` | Public page |
| `contact-mediated` | Form to write to a member. They get email; their address stays hidden. They can refuse messages |
| `map` | Map on the lists (default off) |

Courses, forums, a time bank, payments, OAuth and native apps are not built yet. If they come, they come as modules. You do not need them for the space to exist.

## Try it

After seed, the public face is [http://localhost:3014/showcase](http://localhost:3014/showcase). The seed already has several spaces (alumni, incubator, practice, mentorship), so the switcher has something to switch.

Two Next.js apps, one Postgres. Default locale `pt-BR`, also `en`.

| App | Who | Local |
| --- | --- | --- |
| [apps/web](apps/web) | Visitors, members, coordinators | [http://localhost:3014](http://localhost:3014) |
| [apps/admin](apps/admin) | Super-admin: create spaces, coordinators, modules | [http://localhost:3015](http://localhost:3015) |

**Member app:** email OTP, profile (city via OpenStreetMap), join requests, cohorts, space switcher. Coordinators review joins at `/c/{slug}/coord/approvals`.

**Ops app:** spaces, people, members, cohorts, fields, lists, mail, platform settings, modules per space.

The source is public: [colabcolibri/comuna](https://github.com/colabcolibri/comuna). You can host it and change it. There is no license file in the repo yet. Packages: `@community/*`.

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

Local OTP lands in [Mailpit](http://localhost:8026), not in the API JSON. Postgres is on `localhost:5433`. Env: [docs/08_environments.md](docs/08_environments.md). Do not commit `.env`.

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

In the codebase a space is the `community` tenant (`/c/{slug}/…`). Module packages live under `packages/modules/<slug>`.

## Documentation

| | |
| --- | --- |
| [Scope](docs/00_scope.md) | What the product is |
| [Architecture](docs/05_architecture.md) | Apps, packages, plugin gate |
| [Database](docs/06_database.md) | Schema |
| [API](docs/07_api_contracts.md) | HTTP |
| [Environments](docs/08_environments.md) | Local, SMTP, deploy |
| [Design](docs/09_design_system.md) | UI |
| [Index](docs/README.md) | Full list |
