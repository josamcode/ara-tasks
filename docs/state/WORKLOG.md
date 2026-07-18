# ARA Tasks — Worklog

> **Chronological log of what actually happened.** Newest entries at the bottom — append, never rewrite history.
> Maintained under the state rule in [`CLAUDE.md`](../../CLAUDE.md): every step or change appends here.
>
> **Write for the next person, who has none of your context.** Record dead ends and things that did not work — they are often worth more than the successes, because they stop someone repeating them.
>
> **Format:** `## YYYY-MM-DD — <short title>` then what changed, why, and any ticket ID (`S0-01`).

---

## 2026-07-17 — Project foundation initialized

Initialized repo, scaffolded monorepo structure, moved design docs, created governance and state files.

**Detail:**
- `git init` on the repo root (default branch `main`); added `.gitignore` (node_modules, build output, `.env*`, logs, terraform state, OS/editor cruft) and `.gitattributes` (LF normalization, `*.md` as text, binaries marked).
- Scaffolded the monorepo tree per `Ara_Tasks_System_Architecture.md`: `apps/api/src/{foundation,modules,shared}` with the four-layer `{api,application,domain,infrastructure}` split per slice, the separate `apps/operator-api`, `apps/web`, `apps/operator`, `packages/@ara/{types,ui,config}`, `infra/{terraform,docker}`, `.github/workflows`, `docs/{design,state}`. 81 empty leaf folders, each with a `.gitkeep`.
- Moved all 16 design files (14 `.md`, 1 `.html`, 1 `.jsx`) from the repo root into `docs/design/`. Filenames and contents unchanged — these are the source of truth. Repo root now contains no `Ara_Tasks_*` files.
- Created `CLAUDE.md` — master governance: the state rule (at the top), the project index of all 16 docs, the nine non-negotiable architecture rules, and conventions.
- Created `README.md`, `docs/state/PROJECT_STATE.md` (seeded at Phase 0 / Sprint 0, `Next` = `S0-01 → S0-03 → S0-04 → S0-05 → S0-09`), this worklog, and `docs/state/DECISIONS.md`.
- First commit: `chore: initialize project foundation and structure`.

**Scope note:** structure and documentation only — **no application code was written**, by design. `S0-01` (pnpm + Turborepo init) is the first ticket that adds real config and dependencies.

**Next:** `S0-01` — init the monorepo so `pnpm i` + `turbo build` pass with shared tsconfig/eslint/prettier.

---

## 2026-07-17 — S0-01: Monorepo initialized (pnpm + Turborepo)

Initialized the JS monorepo: root workspace config, 6 workspaces, and shared tooling in `@ara/config`. Toolchain confirmed on this machine: Node 24.16.0, pnpm 11.9.0.

**What landed:**
- Root: `package.json` (`packageManager: pnpm@11.9.0`, engines node `>=24 <25`, turbo scripts), `pnpm-workspace.yaml` (`apps/*`, `packages/@ara/*`), `turbo.json` (build/lint/typecheck/test/dev tasks; `build`+`typecheck` depend on `^build`), root `prettier.config.mjs` re-exporting `@ara/config/prettier`, `.prettierignore` (excludes `docs/design/`).
- `packages/@ara/config`: the single source of shared config — `tsconfig/{base,node-library,react-library,nest,next}.json`, `eslint/{base,next}.js`, `prettier/index.js`, all exposed via the package `exports` map. `dependencies` (not devDeps) hold the eslint/config packages so consumers resolve them transitively.
- `packages/@ara/types`: zod dep, one scaffold schema (`workspaceScaffoldSchema`) marked DELETE-when-real. Builds to `dist/` (CJS + d.ts).
- `packages/@ara/ui`: React 19 peer, one scaffold component. Builds to `dist/`.
- `apps/api`: NestJS 11 minimal `AppModule` + `main.ts` (empty module graph by design), `nest-cli.json`, `tsconfig.build.json`.
- `apps/web`, `apps/operator`: Next 16 App Router minimal `layout.tsx`/`page.tsx`; each scaffold page imports from both shared packages to exercise the workspace graph.
- Removed the now-redundant `.gitkeep` from the 5 leaf folders that gained real files.

**Version pinning (deliberate — `latest` diverges from the locked stack):** pinned TypeScript **5.9.3** (npm `latest` is 7.0.2 — TS 7 is a stack change, not a default), `@types/node` **24.x** (runtime is Node 24 LTS; `latest` is 26.x), and — after hitting a real incompatibility — ESLint **9.39.5** (see below). All recorded in DECISIONS.

**Problems hit and fixed (for the next person):**
1. **pnpm blocked native build scripts** (`sharp`, `unrs-resolver`) on first install (supply-chain hardening) → added an `allowBuilds` allowlist to `pnpm-workspace.yaml` with rationale. Re-install clean.
2. **A design doc went missing.** `docs/design/Ara_Tasks_Component_Library.jsx` was deleted from the working tree mid-task by an external linter/hook in this environment (the same actor that edited `pnpm-workspace.yaml`). Restored byte-for-byte from HEAD via `git restore`; confirmed all 16 design files match HEAD. **Design docs are immutable — watch for this.**
3. **Next 16 removed the `eslint` config key** (it dropped built-in ESLint-during-build). My `next.config.ts` `eslint.ignoreDuringBuilds` failed typecheck (TS2353) → removed it (unnecessary now; lint is a separate task).
4. **ESLint 10 is incompatible with `eslint-config-next@16.2.10`** — the Next babel parser returns a scope manager that ESLint 10 rejects (`scopeManager.addGlobals is not a function`). Downgraded ESLint 10.7.0 → **9.39.5** across all packages. Same class of problem as the TS 7 trap: newest ≠ compatible.
5. **This machine's Application Control policy (WDAC/AppLocker) blocks unsigned native binaries** under `node_modules`. Confirmed message: "An Application Control policy has blocked this file." This blocks `turbo` (native Go/Rust binary → `spawn UNKNOWN`) and Next's default **Turbopack** (native bindings; WASM SWC loads but Turbopack has no WASM path). Documented in DECISIONS with workarounds.

**Verification (this machine):**
- `pnpm install` → exit 0 (7 workspace projects).
- `pnpm -r run typecheck` → exit 0 (6/6).
- `pnpm -r run lint` → exit 0 (6/6).
- Builds: `@ara/types`, `@ara/ui`, `apps/api` → exit 0 (tsc / nest). `apps/web`, `apps/operator` → exit 0 via `next build --webpack` (Turbopack blocked by WDAC; webpack + WASM SWC works). Both prerender `/` and `/_not-found`.
- `pnpm exec turbo build|lint|typecheck` → **cannot run** on this machine (turbo binary blocked by WDAC). The tasks turbo would orchestrate all pass when invoked directly (above). Unaffected in CI/Linux.
- All build output (`dist/`, `.next/`, `next-env.d.ts`) is gitignored; working tree clean of artifacts.

**Next:** `S0-03` — Dockerfiles (`node:24` pinned) + local `docker-compose` (postgres+postgis, redis, minio). Building in Docker/Linux also sidesteps the local native-binary block.

---

## 2026-07-18 — S0-03: Dockerfiles + local Docker Compose stack

Containerized the three Node apps and delivered a one-command local dev stack. `docker compose up -d --build --wait` brings up **all six services healthy**: postgres (PG18 + PostGIS 3.6), redis, minio, api, web, operator — internal `ara-net` network, service-DNS wiring, health-gated startup, persistent named volumes.

**What landed:**
- **Three multi-stage Dockerfiles** (`apps/{api,web,operator}/Dockerfile`), build context = repo root. Pattern: `base` (Node 24 + Corepack pnpm 11.9.0) → `pruner` (`turbo prune <app> --docker`) → `installer` (`pnpm install --frozen-lockfile` + `turbo run build --filter`) → `runner` (non-root). api runtime = `pnpm deploy --legacy --prod` then `node dist/main.js`; web/operator = Next `output:'standalone'` → `node apps/<app>/server.js`.
- **`docker-compose.yml`** (root) — 6 services, named volumes (`ara-postgres-data`/`ara-redis-data`/`ara-minio-data`), `ara-net` bridge, `depends_on … condition: service_healthy`, `${VAR:-default}` local defaults.
- **`.dockerignore`** (root) — excludes node_modules/build outputs/VCS/env/docs so contexts are small and deterministic.
- **`.env.example`** (root) — documents every local default (git-ignore already whitelists it).
- **Next config edit** — added `output:'standalone'` + `outputFileTracingRoot` to `apps/web` and `apps/operator` `next.config.ts`. Used `path.join(process.cwd(), '..','..')` (NOT `__dirname`: the shared tsconfig is `module:esnext` + `moduleDetection:force`, so the config is typed as ESM and `__dirname` fails typecheck; turbo always runs `next build` from the app dir so cwd is stable).
- **Image pins (tag + immutable digest):** node `24-bookworm-slim` (24.18.0), `postgis/postgis:18-3.6`, `redis:7.4.9-alpine`, `minio/minio:RELEASE.2025-09-07T16-13-09Z`.

**Problems hit and fixed (for the next person):**
1. **PostgreSQL 18 changed the data-dir convention.** Mounting the volume at `/var/lib/postgresql/data` (the pre-18 norm) makes the PG18 entrypoint refuse to start ("in 18+, these images store data in a major-version-specific directory"). **Fix:** mount at **`/var/lib/postgresql`** — the image then stores data in a versioned subdir. This bit us as a cascade: postgres exited → api (depends on it) never started → web (depends on api) never started; only redis/minio/operator came up.
2. **`pnpm deploy` needs `--legacy` on pnpm 10+.** Bare `pnpm deploy --prod` errors `ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE` unless workspaces set `inject-workspace-packages=true`. Added `--legacy`.
3. **PostGIS 3.5 has no PG18 image.** `postgis/postgis:18-3.5` is 404; the PG18 line ships **3.6** (`18-3.6`). Still within the locked "PostGIS 3.x". Verified `SELECT PostGIS_Version()` → `3.6 USE_GEOS=1 USE_PROJ=1 USE_STATS=1`.
4. **Port collision.** Both Next apps default to container port 3000. Kept web on host 3000 and api on its native 3001; moved **operator to host 3002** (`3002:3000`). Updated the verification `curl` accordingly.
5. **MinIO image tooling.** A first (mangled) probe suggested no `curl`/`mc`; the real `minio/minio` image ships `bash`, `curl`, and `mc`, so the healthcheck is a clean `curl -f /minio/health/live`.
6. **Running the gates in WSL.** The Windows host blocks turbo (WDAC) and there's no apt/`/usr/bin/node` in WSL — but **nvm** is installed with Node 24.18.0. Non-interactive `bash -lc` picks up the Windows `pnpm` shim from `/mnt/c/...` (→ `node: not found`); sourcing `~/.nvm/nvm.sh` first fixes it. Also: complex quoting corrupts through `wsl.exe bash -lc "…"` — run multi-step logic from a `.sh` file instead.

**Verification (WSL2 Ubuntu, Docker 29.5 / Compose v5.1):**
- `docker compose config --quiet` → 0; `--services` → minio/operator/postgres/redis/api/web.
- `docker compose up -d --build --wait` → 0; `docker compose ps` → 6/6 `running (healthy)`.
- `pg_isready` → accepting connections; PostGIS → `3.6 …`; `redis-cli ping` → `PONG`; MinIO `/minio/health/live` → 0; web `:3000` → 200; operator `:3002` → 200; api `:3001` → 404 (empty scaffold, reachable).
- Named volumes persist across `docker compose down` (verified present after down).
- Monorepo gates (WSL, nvm node): `turbo typecheck` 7/7, `turbo lint` 6/6, `turbo build` 5/5. `git diff --check` clean; working tree has only the intended new/changed files.

**Scope note:** infra only — no schema/migrations, auth, RBAC, business logic, UI, cloud infra, or CI were added. `operator-api` left untouched (not a workspace member yet).

**Next:** `S0-04` — Terraform base infra in-region (managed PG+PostGIS, Redis, private bucket, secret manager).

---

## 2026-07-18 — S0-04: Rebaseline infra onto the existing VPS (Coolify + Docker Compose)

Replaced the **unconfirmed managed-cloud / Terraform** baseline for `S0-04` with an **owner-approved VPS/Coolify** baseline for dev + staging, and shipped a deployment bundle that reuses the S0-03 images. **No app logic, schema, auth, RBAC, or UI** — infra + docs only. The locked app stack, DB technology, modular-monolith, and two-plane boundary are unchanged.

**Owner decision (authoritative):** dev + staging run on the existing **Hostinger VPS** (Ubuntu 24.04, already running **Coolify**), shared with other projects; ARA Tasks must be **isolated** and not alter existing resources. Managed KSA/GCC cloud + Terraform are **deferred to production**, not removed.

**What landed:**
- **`deploy/vps/docker-compose.staging.yml`** — a Coolify-compatible **override** layered on the root `docker-compose.yml`. It inherits each app's `build:`/Dockerfile (no build logic duplicated) and only adjusts runtime posture:
  - `postgres` + `redis` → `ports: !reset null` (no host port at all — private on `ara-net`).
  - `minio` → `ports: !override ["127.0.0.1:9000:9000"]` (S3 API **loopback-only** for the local health check; console 9001 dropped).
  - `api`/`web`/`operator` → `ports: !override ["127.0.0.1:<host>:<container>"]` + `expose:` (loopback for local verification; on the VPS Coolify's proxy routes each **domain** → container over the Docker network).
  - `restart: unless-stopped`, `deploy.resources` CPU/mem limits + reservations (shared-VPS-safe), health checks + digest-pinned images inherited from base, persistent named volumes inherited.
- **`deploy/vps/.env.staging.example`** — every env var Coolify must supply, **placeholders only** (`__CHANGE_ME__`); documents the internal service-DNS DSNs; no real secret/IP/domain.
- **`deploy/vps/README.md`** — the Coolify runbook: isolated project/env → add Compose deployment (both files via `COMPOSE_FILE=…:…` or additional-file) → secrets via Coolify's encrypted env → domains in the UI (never in Git, separate domains for tenant vs operator) → start/update → health/logs → **rollback** (Coolify deployment history) → **stop** ARA Tasks without touching other projects.
- **`deploy/vps/PRE_DEPLOY_CHECKLIST.md`** — disk, memory, port conflicts, network isolation, volume names, backup readiness, compose sanity.
- **`deploy/vps/BACKUP_RESTORE.md`** — Postgres `pg_dump`/`pg_restore` + MinIO `mc mirror`, written **outside** the app volumes, backup destination kept a placeholder (never a real target in Git). Redis (cache/broker) is not backed up.
- **Docs rebaselined** (consistent message: dev/staging = VPS + Coolify + self-hosted PG/Redis/MinIO; managed cloud + Terraform = deferred production path; app stack + two-plane boundary unchanged): Task Breakdown `S0-04` row (new evidence-based Done-when), Roadmap Sprint 0 deliverables, Tech Stack §1 table (Hosting split into dev-staging/production, Containers-deploy, IaC) + §11 + §16, System Design §9 (+ diagram caption), System Architecture §8 (deployment note).
- **DECISIONS.md** — new Accepted row; the **original `S0-04` ticket wording is preserved verbatim** ("Terraform base infra in-region: managed PG+PostGIS, Redis, private bucket, secret manager" / "terraform apply provisions dev env"). Deferred hosting-region row scoped to production.

**Notes / things worth knowing (for the next person):**
1. **Compose merges list fields by APPENDING.** The root file publishes every service on `0.0.0.0` (fine for S0-03 local dev). To make data services private in the *merged* config you MUST strip those bindings with the `!reset`/`!override` merge tags (Compose ≥ 2.24; here Compose v5.1.4). A plain `ports: []` in the override would NOT remove the base's public bindings — it would just append nothing. Verified in the rendered `config`: postgres/redis have **no** `ports:` at all; minio/api/web/operator show `host_ip: 127.0.0.1` only — zero `0.0.0.0` bindings for data services.
2. **api `/` returns HTTP 404** (empty S0-01 scaffold, no routes yet), so `curl --fail http://localhost:3001/` exits non-zero. That is **not an S0-04 regression** — the endpoint is reachable (the container is healthy); `--fail` just rejects ≥400. Reported honestly with the raw exit code + the `404` status; adding a route is out of scope (app logic).
3. **Loopback vs "private."** The `127.0.0.1` host bindings exist only so the ticket's LOCAL `curl` checks pass on the dev machine; they are never on the public interface. On the VPS they are inert — Coolify's proxy reaches the apps over the Docker network and MinIO is reached at `http://minio:9000` on `ara-net`.
4. **Remote Coolify deployment is PENDING.** No `coolify` CLI and no configured non-interactive VPS/SSH access in this environment, and the ticket forbids requesting/printing credentials. The bundle is completed + verified locally; the runbook prints the exact remaining Coolify UI steps. Not faked as deployed.

**Verification (WSL2 Ubuntu, Docker 29.5.3 / Compose v5.1.4):** `config --quiet` → 0; `--services` → 6; `build` → 0; `up -d --wait` → 6/6 healthy; `exec postgres pg_isready` → accepting; PostGIS → `3.6 …`; `exec redis redis-cli ping` → `PONG`; `curl :9000/minio/health/live` → 0; `curl :3000` / `:3002` → 0; `curl --fail :3001` → non-zero (HTTP 404, reachable); rendered `config` shows no public data-service ports; `turbo build` 5/5, `lint` 6/6, `typecheck` 7/7; `git diff --check` clean. `down` (no `-v`) — volumes preserved. Not committed/pushed (awaiting review).

**Next:** `S0-05` — GitHub Actions CI (lint → typecheck → test → build → migrate → deploy dev/staging).

---

## 2026-07-18 — S0-04 (correction): deterministic API-reachability check; full suite now exits 0

Follow-up to the S0-04 entry above. The prior verification used `curl --fail http://localhost:3001/`, which is **guaranteed to exit non-zero** because the empty S0-01 NestJS scaffold correctly returns **HTTP 404** at `/` (no routes yet). That put a command that *cannot* exit 0 inside an otherwise-green suite. This pass corrects the verification method — **no application code, no health endpoint, no Dockerfile/S0-03 change** — so every S0-04 command exits 0 and the "fully verified" claim is honest.

**What changed:**
- **Added `deploy/vps/VERIFY.md`** — the canonical S0-04 local evidence suite. The API step is now a deterministic reachability assertion:
  ```bash
  api_status="$(curl --silent --output /dev/null --write-out '%{http_code}' http://localhost:3001/)"
  test "$api_status" = "404"
  printf 'API reachable with expected scaffold status: %s\n' "$api_status"
  ```
  It connects to `localhost:3001`, confirms the **expected** current status is `404`, and exits 0 **only** on that match. Web + operator still require `2xx`. The doc documents *why* `404` is expected (empty scaffold) and *why* `--fail` is wrong here.
- **Privacy assertion widened to all six services:** the suite now fails on **any** non-loopback (`host_ip` ≠ `127.0.0.1`) published binding, covering postgres/redis (which publish nothing), minio, api, web, operator. Loopback-only is accepted for local checks.
- **Added an independent S0-03 check:** `docker compose config --quiet` (root file only, no override) to prove the S0-03 local stack still validates on its own.
- **State wording corrected** in `PROJECT_STATE.md` (status line + S0-04 row) to state the deterministic `404` assertion and that every command exits 0. The earlier note (this file, entry above, item 2) that `curl --fail :3001` exits non-zero is left intact as accurate history — this entry supersedes the *method*, not the fact.

**No new decision** was introduced (a verification-method refinement, not a stack/design change), so `DECISIONS.md` is unchanged per the ticket's gate.

**Verification (WSL2 Ubuntu, Docker 29.5.3 / Compose v5.1.4) — rerun from a clean state, `down` first; every command exit 0 (script tally: TOTAL NON-ZERO STEPS: 0):** `config --quiet` (override) 0; `config --services` → 6; `build` 0; `up -d --wait` → 6/6 healthy; `pg_isready` accepting; PostGIS `3.6 …`; `redis-cli ping` `PONG`; `curl :9000/minio/health/live` 0; `curl --fail :3000` (web) 0; **api `%{http_code}` == `404`** → prints "API reachable with expected scaffold status: 404", exit 0; `curl --fail :3002` (operator) 0; privacy check → `OK` (no non-loopback bindings; pg/redis publish none); **root `docker compose config --quiet` (S0-03, no override) 0**; `turbo build` 5/5, `lint` 6/6, `typecheck` 7/7; `git diff --check` clean; `down` (no `-v`) → volumes preserved. `.claude/` remains untracked and is **not** part of the intended S0-04 file set. Not committed/pushed (awaiting review).

**Next:** `S0-05` — GitHub Actions CI (lint → typecheck → test → build → migrate → deploy dev/staging).

---

## 2026-07-18 — S0-04: committed the verified baseline on a feature branch

Committed the verified S0-04 change set on a dedicated branch — no push/PR yet.

- **Branch:** `feat/s0-04-vps-coolify-baseline` (off `main`).
- **Commit:** `feat(infra): complete S0-04 VPS Coolify baseline`.
- **Staged exactly 15 paths** (nothing else): the 6 `deploy/vps/` files, `.dockerignore`, the 5 rebaselined design docs (Task Breakdown, Roadmap, Tech Stack, System Design, System Architecture), and the 3 state docs (this file, PROJECT_STATE, DECISIONS). Staged with explicit paths only — never `git add .`/`-A`.
- **`.gitignore` gotcha (for the next person):** `deploy/vps/.env.staging.example` is matched by the `.env.*` ignore rule, and the whitelist `!.env.example` only covers that exact filename — so the staging template was invisible to a plain `git add`. It's a **placeholders-only** file (no secrets), so it was force-added with `git add -f deploy/vps/.env.staging.example`. `.gitignore` was **left untouched** (out of scope for this ticket); real `.env.staging` files with secrets still match `.env.*` and stay ignored. A future cleanup could add an explicit `!deploy/vps/.env.staging.example` whitelist.
- **`.claude/settings.local.json`** (harness-managed) was **not** staged and remains untracked. No `--no-verify`, amend, merge, rebase, or push.

**Next:** `S0-05` — GitHub Actions CI (lint → typecheck → test → build → migrate → deploy dev/staging).
