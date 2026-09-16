# Comuna

The name is ordinary Portuguese: a *comuna* is a place people share. The software is for a group that already exists and needs somewhere to exist as that group — not another feed.

Alumni offices, schools, incubators and practices already hold more than one group, and they usually keep them in spreadsheets. On Comuna you run a single installation and create as many **spaces** as you need. Each space is one group, with its own members and its own modules, and people from one space do not show up in another. Someone can still belong to several: the 2019 alumni year and the incubator can sit on the same install, and a person who is in both switches space and keeps a different profile in each, looking at one space at a time.

Inside a space, members find each other, send a message without publishing an inbox, and can put a public page on the group if they want the world to see it. What someone shares is decided in that space, field by field. A visitor can look without giving an email address. Collective learning and deeper exchange are possible later, as modules you turn on — they are not required to make the space real.

## Chat tools do a different job

Products such as Circle, Discord, Slack and Mighty Networks are built around an ongoing conversation: feeds, channels, threads, unread counts. Comuna is built around the roster and the face of the group. A forum or chat could be added later as a module; it is not what the product is for, and the two kinds of tool can sit side by side.

The source is public on GitHub. You can host it and change it. There is no license file in the repo yet.

## A space

A space starts with people, membership and a basic profile. Someone asks to join; a coordinator of that space accepts or refuses. Members edit their own profile.

A visitor opens `/showcase` with no account — a public page for one space, or a list if several are public. The directory stays behind membership.

| Module | What the space gets | Off |
| --- | --- | --- |
| `directory` | Lists, extra fields, search | 404 / 403, no extra fields |
| `showcase` | Public page | Same |
| `contact-mediated` | Message delivered; address hidden | Same |
| `map` | Map on the lists (default off) | Same |

Packages live under `packages/modules/<slug>`. In the codebase a space is the `community` tenant (`/c/{slug}/…`).

## Try it

After seed, the public face is [http://localhost:3014/showcase](http://localhost:3014/showcase). The seed already has several spaces (alumni, incubator, practice, mentorship) so the switcher has something to switch.

Two Next.js apps, one Postgres. Default locale `pt-BR`, also `en`.

| App | Who | Local |
| --- | --- | --- |
| [apps/web](apps/web) | Visitors, members, coordinators | [http://localhost:3014](http://localhost:3014) |
| [apps/admin](apps/admin) | Super-admin: create spaces, coordinators, modules | [http://localhost:3015](http://localhost:3015) |

Repo: [colabcolibri/comuna](https://github.com/colabcolibri/comuna). Packages: `@community/*`.

**Member app:** email OTP, profile (city via OpenStreetMap), join requests, cohorts, space switcher. Coordinators review joins at `/c/{slug}/coord/approvals`.

**Ops app:** spaces, people, members, cohorts, fields, lists, mail, platform settings, modules per space.

**Not built yet:** courses, forum, time bank, payments, OAuth, native apps. Those would be modules.

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
