# ARA Tasks — Project State

> **This file is the answer to "where is the project right now?"**
> It is maintained under the state rule in [`CLAUDE.md`](../../CLAUDE.md): every step or change updates this file.
> If this file is stale, it is worse than useless — it is misleading.

**Phase:** `Phase 0 — Foundations & Skeleton`
**Sprint:** `Sprint 0`
**Last updated:** 2026-07-18

**Sprint 0 goal (from the Task Breakdown):** invite → login (web + mobile, AR/EN) → a scoped permission enforced server-side; RLS proven; CI deploys to staging.

**Status:** VPS/Coolify infra baseline landed (`S0-04`), on top of the S0-03 local Docker stack. `deploy/vps/docker-compose.staging.yml` is a Coolify-compatible **override** (layered on the root compose, reusing the S0-03 images): PG18+PostGIS, Redis, and MinIO are self-hosted and **private** (no public ports); api/web/operator are exposed only via Coolify's proxy on **separate domains**. Verified locally in WSL2 — `config`/`build`/`up --wait` bring all six services up healthy, PG & Redis publish no host ports and MinIO's S3 API is loopback-only; monorepo gates green. The full S0-04 evidence suite (`deploy/vps/VERIFY.md`) — with a **deterministic API-reachability check that asserts the expected empty-scaffold `404`** (not `curl --fail`, which rejects `404`) — now **exits 0 on every command**, and the root S0-03 compose still validates independently. **Remote Coolify deployment is PENDING** — no non-interactive VPS/Coolify access in this environment; the runbook (`deploy/vps/README.md`) prints the exact UI steps. Managed cloud + Terraform are deferred to production. The verified change set is **committed on branch `feat/s0-04-vps-coolify-baseline`** (not pushed; PR pending). Next action is `S0-05`. **Environment note:** the dev machine's Application Control policy blocks unsigned native binaries, so `turbo`/Turbopack run via the WSL2/Docker path, not the Windows host.

---

## Done

| Ticket | Task | Notes |
|---|---|---|
| — | Repo initialized; monorepo folder tree scaffolded; 16 design docs moved to `docs/design/`; governance (`CLAUDE.md`) + state files created. | Foundation only — structure and docs, no code. |
| **S0-01** | Init monorepo (pnpm + Turborepo): `apps/api,web,operator`, `packages/@ara/ui,types,config`; shared tsconfig/eslint/prettier in `@ara/config`. | `pnpm i` ✓, typecheck ✓ (6/6), lint ✓ (6/6), builds ✓ (`@ara/types`, `@ara/ui`, `api` via tsc/nest; `web`, `operator` via `next build`). `turbo build` itself is blocked locally by machine Application Control policy (native binary) — verified equivalent via `pnpm -r`. Versions pinned to locked lines: TS 5.9.3 (not 7.x), ESLint 9.39.5 (not 10.x), `@types/node` 24.x, Next 16.2.10, Nest 11.1.28. See [`DECISIONS.md`](DECISIONS.md). |
| **S0-03** | Dockerfiles (`node:24` pinned) + local `docker-compose` (postgres+postgis, redis, minio, api, web, operator). | `docker compose up -d --build --wait` → all 6 services healthy. Multi-stage Dockerfiles (turbo prune → pnpm `--frozen-lockfile` → turbo build; api = `pnpm deploy --legacy`, web/operator = Next `output:'standalone'`). Images pinned by digest: node 24.18.0-bookworm-slim, postgis 18-3.6, redis 7.4.9-alpine, minio RELEASE.2025-09-07. Verified in WSL2: PostGIS `3.6`, redis `PONG`, MinIO `/health/live`, web+operator HTTP 200, api HTTP 404 (empty scaffold). Named volumes persist across `down`. Gates green. See [`WORKLOG.md`](WORKLOG.md) / [`DECISIONS.md`](DECISIONS.md). |
| **S0-04** | Rebaseline dev/staging infra on the **existing VPS** (Ubuntu 24.04 + Coolify + Docker Compose): `deploy/vps/` deploy bundle reusing the S0-03 images; managed cloud + Terraform deferred to production. | Owner-approved VPS/Coolify baseline. `deploy/vps/docker-compose.staging.yml` (Coolify override) + `.env.staging.example` + runbook (`README.md`) + `PRE_DEPLOY_CHECKLIST.md` + `BACKUP_RESTORE.md` + `VERIFY.md` (local evidence suite). PG18+PostGIS/Redis/MinIO **private** (no public ports; MinIO S3 loopback-only for the local health check); api/web/operator via Coolify proxy on separate domains; restart policy, health checks (inherited), pinned images, shared-VPS resource limits, persistent named volumes. Verified in WSL2 with **every command exiting 0**: `config`/`build`/`up --wait` → 6/6 healthy, PostGIS `3.6`, redis `PONG`, MinIO `/health/live`, web+operator HTTP 200, **api reachability asserts the expected empty-scaffold 404** (deterministic `%{http_code}` check, not `curl --fail`), no public data-service bindings, root S0-03 compose validates independently; turbo build/lint/typecheck green; volumes persist across `down`. Docs rebaselined: Task Breakdown `S0-04`, Roadmap Sprint 0, Tech Stack §1/§11/§16, System Design §9, System Architecture §8. **Remote Coolify deploy PENDING** (no non-interactive VPS access). See [`WORKLOG.md`](WORKLOG.md) / [`DECISIONS.md`](DECISIONS.md). |

---

## In Progress

| Ticket | Task | Owner | Notes |
|---|---|---|---|
| — | *Nothing in progress.* | — | Pick up `S0-04` next. |

---

## Next

Continuing the **Start-here** order in [`Ara_Tasks_Task_Breakdown.md`](../design/Ara_Tasks_Task_Breakdown.md) (`S0-01` ✓, `S0-03` ✓, `S0-04` ✓ done):
**`S0-05 → S0-09`** — CI + DB pipeline, in that order.

| # | Ticket | Task | Area | Done when |
|---|---|---|---|---|
| 1 | **S0-05** | GitHub Actions CI: lint→typecheck→test→build→migrate→deploy dev/staging | infra | merge to main deploys to staging |
| 2 | **S0-09** | Drizzle setup + `drizzle-kit` migration pipeline + base migration | be | migrations run in CI |

> **S0-04 follow-up (not blocking S0-05):** run the remote Coolify deployment from `deploy/vps/README.md` once someone with VPS/Coolify access can do it (create the isolated ARA Tasks project → add the Compose deployment → set secrets + domains → deploy).

> **S0-02** (Scaffold Flutter app + `ara_ui`, `ara_core`) is intentionally **not** in this repo's queue — it belongs to the separate `ara-mobile` repo. See [`DECISIONS.md`](DECISIONS.md).

**Remaining Sprint 0 backlog** (after the four above): `S0-06 → S0-08` (config/secrets, observability, edge security), `S0-10 → S0-11` (tenancy + RLS), `S0-12 → S0-18` (auth), `S0-19 → S0-22` (RBAC), `S0-23 → S0-28` (design system + shells). Full detail in the Task Breakdown.

---

## Blocked / Open

| Item | Blocks | Needed input |
|---|---|---|
| **Dev-machine Application Control policy blocks native binaries** | Local `turbo` (all commands) and local `next build` (Turbopack). CI/Linux unaffected. | Allowlist the unsigned native binaries under `node_modules` in WDAC/AppLocker, **or** build in WSL / a container / CI. Interim local workaround: run tasks via `pnpm -r` and `next build --webpack`. See [`DECISIONS.md`](DECISIONS.md). |
| Hosting region (GCP Dammam vs AWS Bahrain/UAE) | Nothing in code; **must be settled before production** | Confirm which region carries the PDPL/compliance certs the target clients require. Tracked as `⚠️` in Tech Stack §16. |
| SMS vendor (Unifonic vs Taqnyat) | `S0-15` (OTP-SMS) can proceed on a sandbox adapter | Pick at contract stage on price + deliverability + OTP support. |
