# Comuna

A small open-source platform for groups that want a house, not a feed.

Not a social network. Not another engagement machine. Comuna is for a group that already exists — a cohort, an alumni year, a practice, an incubator — and needs room to be that group in more than one aspect: a roster, a public face, a way to find each other, a way to write without handing over an inbox. Internal tools in service of the people, not a chat that keeps score.

The name is on purpose. A *comuna* is a shared place with a door. You choose when to walk in.

## Why it exists

Most software for groups is built to make people talk more. Unread badges, streaks, a thousand small exchanges as proof that the community is “alive.” That is a particular kind of success. It is not the one this house is built for.

The tension is the point. Fast triggers treat attention as the product. Comuna treats the group as the product. Conversation can happen. Volume is not the prize. Showing up on purpose is.

Circle and its cousins still orbit the thread: spaces, posts, DMs, courses as content. Useful if the job is to keep a conversation running. Comuna is adjacent and different. Closer in temperament to WordPress or Moodle — a stubborn centre, modules you switch on — but the centre is the group, not the classroom or the blog. You come in, you use the tool the group needed, you leave.

What that looks like in practice:

- **Rooms that do not leak.** Group A and group B keep their own people, their own fields, their own tone. Isolation is the point.
- **People over time.** A group that is happening now, and a group that already happened, both deserve a roster that still makes sense.
- **A window, not a megaphone.** The network can be visible to the world. Contact can be possible. An email address does not have to be the price of showing up.
- **A map of consent.** Where people are, what they share, what stays inside — field by field, person by person.
- **Software you visit.** If a forum ever exists here, it should work like the old web: you go there, you read, you leave. It does not sit in your notifications deciding that now is the time.

Some things want to be shared across rooms later — a simple course that several cohorts can pick up or drop, a time bank where offering and asking is a gift of hours, not a product. Those are not the core. They are guests. The core has to stay small enough that adding them does not turn the house into an amusement park.

Expand the edges. Do not fatten the middle.

This is software for people who still believe a network can be a practice, not an audience. It will not save anything. It might help a few rooms stay more intentional than the default.

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

Read-only demo of both apps (two terminals; they can run together):

```bash
pnpm dev:demo
pnpm dev:admin:demo
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
