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
