# ARA Tasks — Project State

> **This file is the answer to "where is the project right now?"**
> It is maintained under the state rule in [`CLAUDE.md`](../../CLAUDE.md): every step or change updates this file.
> If this file is stale, it is worse than useless — it is misleading.

**Phase:** `Phase 0 — Foundations & Skeleton`
**Sprint:** `Sprint 0`
**Last updated:** 2026-07-17

**Sprint 0 goal (from the Task Breakdown):** invite → login (web + mobile, AR/EN) → a scoped permission enforced server-side; RLS proven; CI deploys to staging.

**Status:** Repo foundation laid. No application code exists yet. Next action is `S0-01`.

---

## Done

| Ticket | Task | Notes |
|---|---|---|
| — | Repo initialized; monorepo folder tree scaffolded; 16 design docs moved to `docs/design/`; governance (`CLAUDE.md`) + state files created. | Foundation only — structure and docs, no code. Precedes `S0-01`. |

---

## In Progress

| Ticket | Task | Owner | Notes |
|---|---|---|---|
| — | *Nothing in progress.* | — | Pick up `S0-01` next. |

---

## Next

Seeded from the **Start-here (first 5 tickets)** order in [`Ara_Tasks_Task_Breakdown.md`](../design/Ara_Tasks_Task_Breakdown.md):
**`S0-01 → S0-03 → S0-04 → S0-05 → S0-09`** — repo + Docker + infra + CI + DB pipeline, in that order.

| # | Ticket | Task | Area | Done when |
|---|---|---|---|---|
| 1 | **S0-01** | Init monorepo (pnpm + Turborepo): `apps/api,web,operator`, `packages/@ara/ui,types,config` | infra | `pnpm i` + `turbo build` pass; shared tsconfig/eslint/prettier |
| 2 | **S0-03** | Dockerfiles (`node:24` pinned) + local `docker-compose` (postgres+postgis, redis, minio) | infra | `docker compose up` gives a full local stack |
| 3 | **S0-04** | Terraform base infra in-region: managed PG+PostGIS, Redis, private bucket, secret manager | infra | `terraform apply` provisions dev env |
| 4 | **S0-05** | GitHub Actions CI: lint→typecheck→test→build→migrate→deploy dev/staging | infra | merge to main deploys to staging |
| 5 | **S0-09** | Drizzle setup + `drizzle-kit` migration pipeline + base migration | be | migrations run in CI |

> **S0-02** (Scaffold Flutter app + `ara_ui`, `ara_core`) is intentionally **not** in this repo's queue — it belongs to the separate `ara-mobile` repo. See [`DECISIONS.md`](DECISIONS.md).

**Remaining Sprint 0 backlog** (after the five above): `S0-06 → S0-08` (config/secrets, observability, edge security), `S0-10 → S0-11` (tenancy + RLS), `S0-12 → S0-18` (auth), `S0-19 → S0-22` (RBAC), `S0-23 → S0-28` (design system + shells). Full detail in the Task Breakdown.

---

## Blocked / Open

| Item | Blocks | Needed input |
|---|---|---|
| Hosting region (GCP Dammam vs AWS Bahrain/UAE) | Nothing in code; **must be settled before production** | Confirm which region carries the PDPL/compliance certs the target clients require. Tracked as `⚠️` in Tech Stack §16. |
| SMS vendor (Unifonic vs Taqnyat) | `S0-15` (OTP-SMS) can proceed on a sandbox adapter | Pick at contract stage on price + deliverability + OTP support. |
