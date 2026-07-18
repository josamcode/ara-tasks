# ARA Tasks — Decision Log (ADR-lite)

> **Every decision that shapes the system lands here** — including decisions *not* to change something.
> Maintained under the state rule in [`CLAUDE.md`](../../CLAUDE.md).
>
> **This is also the gate on the locked stack.** The stack in `Ara_Tasks_Tech_Stack_Finalization.md` is locked. To swap, add, or remove a major dependency, or to deviate from a design doc, **you record the proposal here first and get it accepted — you do not act first.** A change that appears in code without an entry here gets reverted, not debated.
>
> Append-only. Superseding a decision = a **new row** that references the old one; never edit or delete history.

---

## Accepted

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-17 | **Mobile app kept in a separate repo (`ara-mobile`).** This repo scaffolds no Dart/Flutter; `S0-02` (Flutter scaffold + `ara_ui`/`ara_core`) is owned by that repo. | Turborepo/pnpm does not manage Dart; melos is Dart-native. Forcing Flutter into a JS monorepo buys nothing and costs tooling friction on both sides. Consistent with Tech Stack §13. Contract between the repos stays the OpenAPI/Zod API contract in `@ara/types` — the mobile repo consumes the API, not the packages. |
| 2026-07-17 (S0-01) | **Version pins at init: TypeScript `5.9.3`, `@types/node` `24.x`, ESLint `9.39.5`.** Not npm `latest`. | The version policy (Tech Stack §5, §17) is *lock the major line, pin the patch*. At init, `latest` had drifted off the locked lines: **TypeScript 7.0.2** (stack locks TS 5.x — TS 7 is a stack change, not a default) and **`@types/node` 26.x** (runtime is Node 24 LTS; 26 types on a 24 runtime is a lie to the compiler). **ESLint** is pinned to 9.x because `eslint-config-next@16.2.10` is incompatible with ESLint 10 (throws `scopeManager.addGlobals is not a function` — its babel parser returns a scope manager ESLint 10 rejects). All three are *within* the locked stack (choosing the compatible line of an already-locked tool), not deviations from it. Revisit ESLint 10 when `eslint-config-next` supports it. |
| 2026-07-17 (S0-01) | **Committed build config keeps stack defaults: Turborepo as orchestrator, Next 16 Turbopack as the build engine.** Did **not** switch to `pnpm`-only or hardcode `next build --webpack`, despite both failing to run on the current dev machine (see the environment blocker below). | Turborepo is locked (Tech Stack §13) and Turbopack is the Next 16 default; both work in CI/Linux and on any machine without the restrictive Application Control policy. Baking a machine-specific workaround into the shared config would degrade CI and every other environment to satisfy one host's security policy. The blocker is an environment issue to fix at the environment, not in the repo. |
| 2026-07-18 (S0-03) | **Docker layout: `docker-compose.yml` + `.dockerignore` at the repo root; one `Dockerfile` per app under `apps/*/`, built with the repo root as context.** | Root compose is what `docker compose …` auto-discovers and what the ticket verification runs from; per-app Dockerfiles co-locate with their app and let each `turbo prune` its own subgraph for smaller contexts and better layer caching. CLAUDE.md's repo-map hints `infra/docker/`, but the more specific S0-03 ticket calls for a **root** compose + root `.dockerignore`; this note reconciles the two. No new top-level folders were invented. |
| 2026-07-18 (S0-03) | **Container-build details, all *within* the locked stack (not deviations).** (a) Next apps use `output:'standalone'` + `outputFileTracingRoot` for self-contained runtime images; (b) base image `node:24-bookworm-slim` (Debian, **not** Alpine); (c) Postgres image `postgis/postgis:18-3.6`; (d) PG18 volume mounts at `/var/lib/postgresql`; (e) local host ports web `3000` / api `3001` / operator `3002`. | (a) Standard Next-in-Docker pattern; a minimal, container-only config edit (ticket-permitted). Used `process.cwd()` not `__dirname` because the shared tsconfig types the config as ESM. (b) Debian glibc gives reliable prebuilt binaries for the two `allowBuilds` natives (`sharp`, `unrs-resolver`); musl/Alpine adds risk. (c) PG18 ships **no** PostGIS 3.5 image — 3.6 is the PG18 build and stays inside the locked "PostGIS 3.x". (d) PG18 changed its data-dir convention; the pre-18 `/var/lib/postgresql/data` mount makes the container refuse to start. (e) Both Next apps default to container port 3000; operator moved to host 3002 to avoid clashing with api on 3001. |

---

## Proposed / Open

| Date | Proposal | Status | Notes |
|---|---|---|---|
| — | *(none)* | — | Propose changes to the locked stack or a design doc here. Do not implement before acceptance. |

---

## Inherited — already settled in the design docs

Recorded here so nobody re-litigates them. These are **not open**; each has a rationale in its source doc.

| Decision | Source |
|---|---|
| Modular monolith for the tenant plane + a physically separate operator service | `Ara_Tasks_System_Architecture.md` (`AD-1`) |
| Drizzle ORM over Prisma — direct SQL control for PostGIS geography types and RLS policies | `Ara_Tasks_Tech_Stack_Finalization.md` §5 |
| Self-built auth (jose + argon2 + TOTP) over a managed identity provider — data residency, custom device binding, two token audiences | `Ara_Tasks_Tech_Stack_Finalization.md` §6 |
| Permissions resolved per request (Redis-cached), never baked into the JWT — makes revocation instant | `Ara_Tasks_Tech_Stack_Finalization.md` §6 · `Ara_Tasks_Security_Design.md` |
| Shared DB + `tenant_id` + RLS as the backstop under the app scope engine | `Ara_Tasks_Tech_Stack_Finalization.md` §5 |
| Custom component library (`@ara/ui`), no UI kit (MUI/AntD) | `Ara_Tasks_Tech_Stack_Finalization.md` §2 |
| Node 24 LTS — production runs LTS/stable only; do not ship on a "Current" line | `Ara_Tasks_Tech_Stack_Finalization.md` §17 |

---

## Deferred — needs an external input (`⚠️`)

These are **not** decisions to make in code. They need a contract or a compliance answer.

| Item | Blocking | Needed |
|---|---|---|
| **Hosting region** — GCP Dammam (KSA) vs AWS Bahrain (me-south-1) / UAE (me-central-1) | Nothing in code; **must be settled before production** | Confirm the region carries the PDPL/compliance certs the target clients require. Most important open item (Tech Stack §16). |
| **SMS vendor** — Unifonic vs Taqnyat (Twilio fallback) | `S0-15` proceeds on a sandbox adapter meanwhile | Pick at contract stage on price + deliverability + OTP support. |

---

## Environment constraints (not stack decisions — but they shape how we work)

| Discovered | Constraint | Impact & workaround |
|---|---|---|
| 2026-07-17 (S0-01) | **The dev machine runs an Application Control policy (Windows Defender Application Control / AppLocker) that blocks unsigned native executables under `node_modules`.** Confirmed error: *"An Application Control policy has blocked this file."* | Blocks **`turbo`** (native binary → `spawn UNKNOWN`, so *all* `turbo …` commands) and Next's default **Turbopack** (needs native bindings; WASM SWC loads but Turbopack has no WASM fallback). tsc / nest / eslint (pure Node) are unaffected. **Not a code defect** — verified every task turbo would run passes via `pnpm -r run {build,lint,typecheck}` and `next build --webpack`. **To fix at the environment (pick one):** (a) allowlist the required native binaries in the WDAC/AppLocker policy — e.g. `@turbo/windows-64`, `@next/swc-win32-x64-msvc`; (b) develop in **WSL2** or a **Linux container**; (c) rely on **CI** (GitHub Actions, Linux) for `turbo build`. **Interim local commands:** `pnpm -r run <task>` and `next build --webpack`. This will recur for future native tooling (e.g. esbuild, drizzle-kit native bits), so resolving it at the environment is the durable fix. |
