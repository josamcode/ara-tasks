# CLAUDE.md — ARA Tasks Governance

**ARA Tasks** is a multi-tenant, KSA-first SaaS for field/branch workforce management: assign → check-in (geofence-verified) → do + prove → approve → report. Delivered as a Flutter mobile app (employee + manager), a Next.js web dashboard (owner/admin), and a separate operator console.

---

## 🛑 THE STATE RULE — READ THIS FIRST

> ### After EVERY step or change, you MUST update `docs/state/PROJECT_STATE.md` and append to `docs/state/WORKLOG.md`. If a decision was made, also update `docs/state/DECISIONS.md`.
>
> ### No task is considered DONE until the state files reflect it.
>
> **This is a permanent Definition of Done that applies to every developer and every AI agent, on every task, forever.**

Why this exists: this repo is built by humans *and* AI agents across many sessions with no shared memory. The state files in `docs/state/` **are** the shared memory. Code that ships without a state update is invisible to the next person — treat the update as part of the change, not paperwork after it.

**Practically, that means every unit of work ends with:**

1. `docs/state/PROJECT_STATE.md` — move the item between `## Done` / `## In Progress` / `## Next`; correct the Phase & Sprint if it changed.
2. `docs/state/WORKLOG.md` — append a dated line describing what actually happened (including dead ends — they save the next person the trip).
3. `docs/state/DECISIONS.md` — only if a decision was made, or a locked choice was challenged.

---

## a) Project Index

The design is **finished and is the source of truth**. Do not redesign, re-derive, or "improve" what these files already settle — read them first, build to them, and if one is wrong, raise it as a proposal in `docs/state/DECISIONS.md` rather than diverging in code.

All live in [`docs/design/`](docs/design/).

| # | Document | What it settles |
|---|---|---|
| 1 | [Ara_Tasks_Features_Identification.md](docs/design/Ara_Tasks_Features_Identification.md) | Master catalog of every feature, lean MVP → full product. Source of the feature IDs used everywhere else. |
| 2 | [Ara_Tasks_Feature_Catalog.md](docs/design/Ara_Tasks_Feature_Catalog.md) | For each feature: what it does, who uses it, and why it exists (tied to the owner's real pains). |
| 3 | [Ara_Tasks_User_Roles_and_Permissions.md](docs/design/Ara_Tasks_User_Roles_and_Permissions.md) | **Authority document for access control** across both planes — every role and exactly what it may do. |
| 4 | [Ara_Tasks_User_Flows_and_Workflows.md](docs/design/Ara_Tasks_User_Flows_and_Workflows.md) | The real journeys: the daily loop from login to a task actually *approved*, plus onboarding, corrections, escalation, offline sync. |
| 5 | [Ara_Tasks_Business_Logic_and_Rules.md](docs/design/Ara_Tasks_Business_Logic_and_Rules.md) | The deterministic rules under the flows — when/who/what-happens, state changes, conflict resolution. Source of the `BR-*` rule IDs. |
| 6 | [Ara_Tasks_System_Design.md](docs/design/Ara_Tasks_System_Design.md) | The end-to-end system: clients, backend, DB, storage, auth, notifications, infra. Home of decision `AD-1`. |
| 7 | [Ara_Tasks_System_Architecture.md](docs/design/Ara_Tasks_System_Architecture.md) | **Architectural style (modular monolith + separate operator plane) and the module breakdown** — what each module owns and how modules talk. |
| 8 | [Ara_Tasks_Tech_Stack_Finalization.md](docs/design/Ara_Tasks_Tech_Stack_Finalization.md) | **🔒 The locked stack.** Exact frameworks, versions, and rationale. The decision record the whole team builds against. |
| 9 | [Ara_Tasks_Database_Design.md](docs/design/Ara_Tasks_Database_Design.md) | Every table, column, and relationship. |
| 10 | [Ara_Tasks_API_Contract.md](docs/design/Ara_Tasks_API_Contract.md) | The HTTP API — endpoints per module, shapes, required permissions, error codes. The contract mobile + web + operator all build against. |
| 11 | [Ara_Tasks_Security_Design.md](docs/design/Ara_Tasks_Security_Design.md) | Every security control: authn, tokens, RBAC, rate limits, validation, media, tenant isolation, PDPL, secrets, monitoring. |
| 12 | [Ara_Tasks_UIUX_Design_System.md](docs/design/Ara_Tasks_UIUX_Design_System.md) | Single source of truth for how the product looks and behaves: tokens, the bilingual/bidirectional system, components, page catalog. |
| 13 | [Ara_Tasks_Component_Library.jsx](docs/design/Ara_Tasks_Component_Library.jsx) | Reference implementation of the component library. **Design reference only — not a build target.** |
| 14 | [Ara_Tasks_UI_Mockups.html](docs/design/Ara_Tasks_UI_Mockups.html) | Approved visual mockups (AR-RTL). **Design reference only.** |
| 15 | [Ara_Tasks_Implementation_Roadmap.md](docs/design/Ara_Tasks_Implementation_Roadmap.md) | Phases → sprints, each with goal, scope, and definition of done. |
| 16 | [Ara_Tasks_Task_Breakdown.md](docs/design/Ara_Tasks_Task_Breakdown.md) | **The backlog.** Roadmap converted to ticket-level tasks (`S<sprint>-<n>`) with "Done when" acceptance lines. |

**Reading order for a new contributor:** 8 (stack) → 7 (architecture) → 3 (permissions) → 5 (rules) → 16 (what to build next).

---

## b) Architecture Rules — Non-Negotiable

These are invariants, not preferences. A PR that breaks one does not merge.

### 1. The stack is locked
Build against `Ara_Tasks_Tech_Stack_Finalization.md` exactly: Turborepo + pnpm, NestJS (tenant + operator planes), Next.js 16 web, PostgreSQL 18 + PostGIS with Drizzle, Redis 7 + BullMQ.
**Never swap, add, or remove a major dependency without an entry in `docs/state/DECISIONS.md` first.** "It's just one small library" is how a locked stack dies. Propose it, record it, then act — in that order.

### 2. Modules own their tables — absolutely
Every module owns its tables. **No module reads, writes, or JOINs another module's tables. Ever.** There is no "just this once" exception; the first one ends the modular monolith and you get a distributed ball of mud with none of the benefits.

Cross-module communication has exactly two legal forms:
- **Synchronous:** call the other module's *published interface* (its public service contract) — never its repositories, never its tables.
- **Asynchronous:** publish a **domain event** through the **transactional outbox** (`apps/api/src/shared/outbox/`).

Need another module's data in a query? That is a signal to either publish an event and keep a local read model, or move the logic to the module that owns the data.

### 3. Business logic lives in `domain/`, never in `api/`
Controllers **orchestrate**; they do not **decide**. A controller may authenticate, validate, delegate, and map a result to a response. The moment a controller contains a business rule (an `if` about *domain* state), that rule belongs in `domain/`.

The four layers in each module:

| Layer | Holds | May depend on |
|---|---|---|
| `api/` | Controllers, DTO wiring, route + guard declarations | `application/` |
| `application/` | Use-cases, orchestration, transactions | `domain/`, published interfaces of other modules |
| `domain/` | **Entities, value objects, business rules, state machines** | nothing outside itself |
| `infrastructure/` | Drizzle repositories, adapters, external clients | `domain/` (implements its ports) |

`domain/` is the center: it depends on nothing and everything depends on it.

### 4. Dependency direction is one-way
Domain modules (`modules/*`) may depend on **`foundation/*` only** — never on each other's internals. Foundation never depends on a domain module.
**No circular dependencies**, at any level. This is enforced in CI by module-boundary linting (S0-01); do not disable the rule to land a PR.

### 5. The two planes never touch
The tenant plane (`apps/api`) and the operator plane (`apps/operator-api`) are **physically separate services**. They **never** share a process, credentials, or direct database access. The operator plane has **no default access to tenant data** — break-glass API only, time-boxed, consented, and dual-audited. A token minted for one plane must be rejected by the other (separate audience).

### 6. One schema, one place
**Zod schemas are defined ONCE in `@ara/types`** and imported by web *and* api. **Never duplicate a schema.** A duplicated schema is a contract that silently drifts until production disagrees with itself. `@ara/types` is the single API contract.

### 7. Permissions are resolved per-request
Permissions are resolved **per request** (Redis-cached), **never baked into the JWT**. A JWT with permissions inside is a permission you cannot revoke until it expires. Tokens carry identity (`user_id`, `tenant_id`, audience) — never authority.
Guards are **deny-by-default**: no explicit permission means 403.

### 8. Every tenant table carries `tenant_id` + RLS
Every tenant-scoped table has a `tenant_id` column and an RLS `tenant_isolation` policy; `app.tenant_id` is set per request. RLS is the **backstop underneath** the application scope engine — not a replacement for it. (Enforced from S0-10/S0-11 onward, when tables exist.)

### 9. Secrets never enter the repo
**Never commit secrets or `.env` values.** All secrets come from the cloud secret manager. `.env*` is gitignored; keep it that way. A secret in git history is a secret that must be rotated.

---

## c) Conventions

**Commits — [Conventional Commits](https://www.conventionalcommits.org/):**
```
<type>(<scope>): <subject>

feat(attendance): add geofence check to check-in endpoint
fix(auth): reject refresh token after reuse detection
chore: initialize project foundation and structure
```
Types: `feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `perf` · `build` · `ci`.
Scope = the module or package (`attendance`, `rbac`, `@ara/ui`, `infra`).

**Branches:** `feat/…` · `fix/…` · `chore/…` — e.g. `feat/s0-09-drizzle-pipeline`. Reference the ticket ID from `Ara_Tasks_Task_Breakdown.md` where one exists.

**Pull requests must pass** lint → typecheck → test (wired in S0-05; until then, run them locally). A PR also:
- keeps modules within their boundaries (rule 2 + 4),
- ships auth + scope guard + Zod validation + audit entry for every mutating endpoint,
- includes a bilingual screenshot (AR-RTL **and** EN-LTR) for any UI change,
- **updates the state files** — see the state rule at the top.

---

## d) Repo Map

```
apps/
  api/src/              # tenant plane — NestJS modular monolith
    foundation/         # auth, tenancy, rbac, audit, notifications, localization
    modules/            # organization, users, shifts, attendance, tasks,
                        # proof, approvals, reports, billing, settings
    shared/             # events, outbox, common
  operator-api/src/     # operator plane — SEPARATE NestJS service
  web/src/              # tenant dashboard — Next.js 16
  operator/src/         # operator console — Next.js 16
packages/@ara/
  types/                # Zod schemas + shared types  = THE API contract
  ui/                   # component library
  config/               # eslint / tsconfig / tailwind preset
infra/terraform/        # IaC
infra/docker/           # Dockerfiles + local compose stack
.github/workflows/      # CI
docs/design/            # the 16 design docs — SOURCE OF TRUTH
docs/state/             # PROJECT_STATE · WORKLOG · DECISIONS — the shared memory
```

Every folder is currently an empty scaffold (`.gitkeep`). Structure is intentional and comes from `Ara_Tasks_System_Architecture.md` — do not invent new top-level folders without a decision entry.

**The Flutter mobile app is NOT in this repo.** It lives in a separate `ara-mobile` repo — see `docs/state/DECISIONS.md`. Do not scaffold Dart/Flutter here.

---

## e) Working Agreements

- **Design docs are the source of truth.** Disagree with one? Record a proposal in `DECISIONS.md`. Do not diverge silently in code.
- **Split anything > 2 days.** Keep tickets shippable.
- **Every screen composes `@ara/ui`** — no one-off styling; passes AR-RTL and EN-LTR.
- **When in doubt about what to build next**, read `docs/state/PROJECT_STATE.md` → `## Next`, then find the ticket in `Ara_Tasks_Task_Breakdown.md`.

---

**Start here → `docs/state/PROJECT_STATE.md` tells you where the project is. `Ara_Tasks_Task_Breakdown.md` tells you what's next. This file tells you the rules. Then update the state files.**
