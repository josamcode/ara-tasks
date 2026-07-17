# ARA Tasks

**ARA Tasks** is a multi-tenant, KSA-first SaaS for managing a distributed workforce across branches — the daily loop is *assign → check-in → do + prove → approve → report*. Employees and managers use one Flutter mobile app to check in inside a geofence on a bound device, work their tasks, and capture photo proof; owners and admins use a Next.js web dashboard for org structure, roles and permissions, live attendance, approvals, and reporting. A separate operator console runs the SaaS itself (tenant provisioning, plans, billing, support). It is bilingual AR-RTL / EN-LTR throughout, and built for PDPL data residency in-region.

**Start here → read [`CLAUDE.md`](CLAUDE.md).** It is the governance file: the rules, the index to every design document, and the state rule that every contributor and AI agent follows.

---

## Repo layout

```
apps/
  api/src/              # tenant plane — NestJS modular monolith
    foundation/         # auth · tenancy · rbac · audit · notifications · localization
    modules/            # organization · users · shifts · attendance · tasks
                        # proof · approvals · reports · billing · settings
    shared/             # events · outbox · common
  operator-api/src/     # operator plane — SEPARATE NestJS service
    platform/
  web/src/              # tenant dashboard — Next.js 16
  operator/src/         # operator console — Next.js 16
packages/@ara/
  types/                # Zod schemas + shared types = the one API contract
  ui/                   # component library
  config/               # eslint / tsconfig / tailwind preset
infra/
  terraform/            # IaC
  docker/               # Dockerfiles + local compose stack
.github/workflows/      # CI
docs/
  design/               # the 16 design documents — source of truth
  state/                # PROJECT_STATE · WORKLOG · DECISIONS
```

Each module follows a four-layer split — `api/` (controllers) · `application/` (use-cases) · `domain/` (business rules) · `infrastructure/` (repositories, adapters).

> The tree is currently an empty scaffold (`.gitkeep` in every leaf). No application code exists yet — the first ticket, `S0-01`, initializes pnpm + Turborepo.

---

## Where things live

| Looking for | Go to |
|---|---|
| The rules, and the index of all design docs | [`CLAUDE.md`](CLAUDE.md) |
| The design (features, architecture, DB, API, security, UI) | [`docs/design/`](docs/design/) |
| Where the project is right now, and what's next | [`docs/state/PROJECT_STATE.md`](docs/state/PROJECT_STATE.md) |
| What happened and when | [`docs/state/WORKLOG.md`](docs/state/WORKLOG.md) |
| Why something was decided | [`docs/state/DECISIONS.md`](docs/state/DECISIONS.md) |
| What to build next, ticket by ticket | [`docs/design/Ara_Tasks_Task_Breakdown.md`](docs/design/Ara_Tasks_Task_Breakdown.md) |

---

## 📱 The mobile app is not in this repo

The Flutter app lives in a **separate `ara-mobile` repo** — Turborepo/pnpm does not manage Dart. Do not scaffold Flutter here. See [`docs/state/DECISIONS.md`](docs/state/DECISIONS.md).

---

## Stack (locked)

Turborepo + pnpm · NestJS 11 on Node 24 LTS · Next.js 16 + React 19 + Tailwind v4 · PostgreSQL 18 + PostGIS with Drizzle · Redis 7 + BullMQ · S3-compatible storage · Flutter 3.44 (separate repo).

The stack is **locked** — see [`docs/design/Ara_Tasks_Tech_Stack_Finalization.md`](docs/design/Ara_Tasks_Tech_Stack_Finalization.md). Changing a major dependency requires an entry in [`docs/state/DECISIONS.md`](docs/state/DECISIONS.md) first.

---

## Contributing

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — `feat(attendance): …`, `fix(auth): …`, `chore: …`
- **Branches:** `feat/…` · `fix/…` · `chore/…`
- **PRs** must pass lint → typecheck → test (wired in `S0-05`).
- **Every change updates the state files.** This is the Definition of Done — see the state rule at the top of [`CLAUDE.md`](CLAUDE.md).
