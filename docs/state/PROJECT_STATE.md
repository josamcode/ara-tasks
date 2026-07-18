# ARA Tasks — Project State

> **This file is the answer to "where is the project right now?"**
> It is maintained under the state rule in [`CLAUDE.md`](../../CLAUDE.md): every step or change updates this file.
> If this file is stale, it is worse than useless — it is misleading.

**Phase:** `Phase 0 — Foundations & Skeleton`
**Sprint:** `Sprint 0`
**Last updated:** 2026-07-18

**Sprint 0 goal (from the Task Breakdown):** invite → login (web + mobile, AR/EN) → a scoped permission enforced server-side; RLS proven; CI deploys to staging.

**Status:** CI/CD pipeline landed (`S0-05`) on top of the S0-04 VPS/Coolify baseline. `.github/workflows/ci.yml` is one pipeline with three trusted triggers: `pull_request` (validation only — **no secrets, no deploy**), `push`→`main` (validate → **automatic staging deploy**), and `workflow_dispatch` (validate → manual **development or staging** deploy). Validation runs `install → format:check → lint → typecheck → test → build` + both Compose configs. Deploy = honest **migration-stage gate** (visible `S0-09`-pending notice; exits 0; drop-in ready when `db:migrate:ci` exists) → **Coolify webhook** trigger (env-scoped `COOLIFY_WEBHOOK`/`COOLIFY_TOKEN`, `Authorization: Bearer`, never printed) → **bounded reachability verification** (web/operator `2xx`, api `API_EXPECTED_STATUS`=404). Actions pinned to immutable commit SHAs; least-priv `permissions`; timeouts; validation cancels stale runs while deploys **serialize per env and never cancel in-progress**. Helper scripts under `scripts/ci/` (`validate-workflows.sh` = pinned actionlint, `run-migration-stage.sh`, `trigger-coolify.sh --dry-run`, `verify-deployment.sh`). Verified locally in WSL2 — **every gate exits 0**, actionlint clean, migration gate honest, Coolify dry-run redacted, and the staging stack (6/6 healthy, data services private) passes `verify-deployment.sh` (web 200 / operator 200 / api 404). **Remote acceptance is PENDING** — the two GitHub Environments (`development`/`staging`), their secrets/vars, and the Coolify deploy resources/webhooks must be created in the UI (see `.github/CI_CD_SETUP.md`); **merge-to-main→staging deploy is NOT yet proven end-to-end.** Committed (`d13ebf8`) on `feat/s0-05-github-actions-cicd` and pushed; **PR [#3](https://github.com/josamcode/ara-tasks/pull/3) is open and its PR-validation passed on GitHub runners** (Validate ✓ in 43s; Deploy correctly **skipped** on PRs → the secret-free validation path is proven remotely). Not merged. Next action is `S0-09`. **Environment note:** the dev machine's Application Control policy blocks unsigned native binaries, so `turbo`/Turbopack run via the WSL2/Docker path, not the Windows host.

---

## Done

| Ticket | Task | Notes |
|---|---|---|
| — | Repo initialized; monorepo folder tree scaffolded; 16 design docs moved to `docs/design/`; governance (`CLAUDE.md`) + state files created. | Foundation only — structure and docs, no code. |
| **S0-01** | Init monorepo (pnpm + Turborepo): `apps/api,web,operator`, `packages/@ara/ui,types,config`; shared tsconfig/eslint/prettier in `@ara/config`. | `pnpm i` ✓, typecheck ✓ (6/6), lint ✓ (6/6), builds ✓ (`@ara/types`, `@ara/ui`, `api` via tsc/nest; `web`, `operator` via `next build`). `turbo build` itself is blocked locally by machine Application Control policy (native binary) — verified equivalent via `pnpm -r`. Versions pinned to locked lines: TS 5.9.3 (not 7.x), ESLint 9.39.5 (not 10.x), `@types/node` 24.x, Next 16.2.10, Nest 11.1.28. See [`DECISIONS.md`](DECISIONS.md). |
| **S0-03** | Dockerfiles (`node:24` pinned) + local `docker-compose` (postgres+postgis, redis, minio, api, web, operator). | `docker compose up -d --build --wait` → all 6 services healthy. Multi-stage Dockerfiles (turbo prune → pnpm `--frozen-lockfile` → turbo build; api = `pnpm deploy --legacy`, web/operator = Next `output:'standalone'`). Images pinned by digest: node 24.18.0-bookworm-slim, postgis 18-3.6, redis 7.4.9-alpine, minio RELEASE.2025-09-07. Verified in WSL2: PostGIS `3.6`, redis `PONG`, MinIO `/health/live`, web+operator HTTP 200, api HTTP 404 (empty scaffold). Named volumes persist across `down`. Gates green. See [`WORKLOG.md`](WORKLOG.md) / [`DECISIONS.md`](DECISIONS.md). |
| **S0-04** | Rebaseline dev/staging infra on the **existing VPS** (Ubuntu 24.04 + Coolify + Docker Compose): `deploy/vps/` deploy bundle reusing the S0-03 images; managed cloud + Terraform deferred to production. | Owner-approved VPS/Coolify baseline. `deploy/vps/docker-compose.staging.yml` (Coolify override) + `.env.staging.example` + runbook (`README.md`) + `PRE_DEPLOY_CHECKLIST.md` + `BACKUP_RESTORE.md` + `VERIFY.md` (local evidence suite). PG18+PostGIS/Redis/MinIO **private** (no public ports; MinIO S3 loopback-only for the local health check); api/web/operator via Coolify proxy on separate domains; restart policy, health checks (inherited), pinned images, shared-VPS resource limits, persistent named volumes. Verified in WSL2 with **every command exiting 0**: `config`/`build`/`up --wait` → 6/6 healthy, PostGIS `3.6`, redis `PONG`, MinIO `/health/live`, web+operator HTTP 200, **api reachability asserts the expected empty-scaffold 404** (deterministic `%{http_code}` check, not `curl --fail`), no public data-service bindings, root S0-03 compose validates independently; turbo build/lint/typecheck green; volumes persist across `down`. Docs rebaselined: Task Breakdown `S0-04`, Roadmap Sprint 0, Tech Stack §1/§11/§16, System Design §9, System Architecture §8. **Remote Coolify deploy PENDING** (no non-interactive VPS access). See [`WORKLOG.md`](WORKLOG.md) / [`DECISIONS.md`](DECISIONS.md). |
| **S0-05** | GitHub Actions CI: lint→typecheck→test→build→migrate→deploy dev/staging. | **Repo implementation complete + locally verified; remote acceptance PENDING.** `.github/workflows/ci.yml` (one pipeline: PR=validate-only/no-secrets, push→main=validate+auto staging deploy, dispatch=validate+manual dev/staging), `scripts/ci/{validate-workflows,run-migration-stage,trigger-coolify,verify-deployment}.sh`, `.github/CI_CD_SETUP.md`, `deploy/vps/README.md` CI/CD section. Actions pinned to commit SHAs; least-priv perms; timeouts; validation cancels stale runs, deploys serialize per env & never cancel in-progress. Migration stage = honest `S0-09`-pending notice (exit 0), drop-in for real migrations. Coolify trigger uses env-scoped secrets + `Authorization: Bearer`, never prints URL/token; `--dry-run` needs no secrets. Verified in WSL2 (every gate exit 0): `install/format:check/lint/typecheck/test/build`, both compose `config`, actionlint (1.7.7, no problems), migration gate, Coolify dry-run (redacted), staging stack 6/6 healthy + `verify-deployment.sh` web 200 / operator 200 / api 404. Also fixed a **pre-existing latent `format:check` failure** (S0-03/S0-04 compose YAML used double quotes vs the repo's `singleQuote`) — reformatted (semantically inert; rendered `docker compose config` byte-identical) and excluded harness `.claude/` from prettier. Committed `d13ebf8` on `feat/s0-05-github-actions-cicd`; **PR #3 open, PR-validation green on GitHub** (Validate ✓, Deploy skipped on PR → secret-free path proven). **Not merged; `merge→staging` deploy still pending** GitHub Environments + Coolify resources. See [`WORKLOG.md`](WORKLOG.md) / [`DECISIONS.md`](DECISIONS.md). |

---

## In Progress

| Ticket | Task | Owner | Notes |
|---|---|---|---|
| **S0-05** | Remote acceptance (staging deploy). | — | Repo side done, committed (`d13ebf8`), pushed, **PR #3 open with green PR-validation** (secret-free path proven). Remaining: create the `development`/`staging` GitHub Environments + secrets/vars and the Coolify deploy resources/webhooks per [`.github/CI_CD_SETUP.md`](../../.github/CI_CD_SETUP.md), disable Coolify auto-deploy-on-push, then prove `main`→staging deploy + Coolify completion + web/operator `2xx` + api expected status. |

---

## Next

Continuing the **Start-here** order in [`Ara_Tasks_Task_Breakdown.md`](../design/Ara_Tasks_Task_Breakdown.md) (`S0-01` ✓, `S0-03` ✓, `S0-04` ✓, `S0-05` ✓ repo-side done):
**`S0-09`** — Drizzle setup + the migration pipeline.

| # | Ticket | Task | Area | Done when |
|---|---|---|---|---|
| 1 | **S0-09** | Drizzle setup + `drizzle-kit` migration pipeline + base migration | be | migrations run in CI |

> **S0-09 wires straight into S0-05:** add a canonical `db:migrate:ci` script to `@ara/api` and the pipeline's migration stage runs it automatically (and add the migration env, e.g. `DATABASE_URL`, to the deploy job) — **no pipeline redesign needed**; `scripts/ci/run-migration-stage.sh` already detects the script and propagates its exit code.

> **Remote-acceptance follow-ups (need UI/credential access; not blocking S0-09):**
> - **S0-05:** create the `development`/`staging` GitHub Environments + secrets/vars and the Coolify deploy resources/webhooks (`.github/CI_CD_SETUP.md`), disable Coolify auto-deploy-on-push, then prove `main`→staging.
> - **S0-04:** run the first remote Coolify deployment from `deploy/vps/README.md` (isolated project → Compose deployment → secrets + domains → deploy).

> **S0-02** (Scaffold Flutter app + `ara_ui`, `ara_core`) is intentionally **not** in this repo's queue — it belongs to the separate `ara-mobile` repo. See [`DECISIONS.md`](DECISIONS.md).

**Remaining Sprint 0 backlog** (after the four above): `S0-06 → S0-08` (config/secrets, observability, edge security), `S0-10 → S0-11` (tenancy + RLS), `S0-12 → S0-18` (auth), `S0-19 → S0-22` (RBAC), `S0-23 → S0-28` (design system + shells). Full detail in the Task Breakdown.

---

## Blocked / Open

| Item | Blocks | Needed input |
|---|---|---|
| **Dev-machine Application Control policy blocks native binaries** | Local `turbo` (all commands) and local `next build` (Turbopack). CI/Linux unaffected. | Allowlist the unsigned native binaries under `node_modules` in WDAC/AppLocker, **or** build in WSL / a container / CI. Interim local workaround: run tasks via `pnpm -r` and `next build --webpack`. See [`DECISIONS.md`](DECISIONS.md). |
| Hosting region (GCP Dammam vs AWS Bahrain/UAE) | Nothing in code; **must be settled before production** | Confirm which region carries the PDPL/compliance certs the target clients require. Tracked as `⚠️` in Tech Stack §16. |
| SMS vendor (Unifonic vs Taqnyat) | `S0-15` (OTP-SMS) can proceed on a sandbox adapter | Pick at contract stage on price + deliverability + OTP support. |
