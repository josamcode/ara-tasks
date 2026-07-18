# ARA Tasks — Tech Stack Finalization

**Purpose:** Lock the tools. This is the decision record the whole team builds against — exact frameworks, languages, libraries, and infrastructure, with versions and rationale. It finalizes the direction set in *System Design* and *System Architecture*.

**Version policy (read first):** we **lock the major line** (e.g. Node 24 LTS, Next 16), and **pin the exact patch at project init** (`package.json`, `pubspec.yaml`, Docker base images). Production runs **LTS/stable only** — never a "Current"/beta line. All versions below were **verified July 2026**; confirm the exact patch with `npm show <pkg> version` / `flutter --version` at kickoff.

---

## 1. The Locked Stack (master)

| Layer | Tool | Version (locked line) | Status | Why |
|---|---|---|---|---|
| Mobile (Employee+Manager, 1 app) | **Flutter / Dart** | Flutter 3.44+ · Dart 3.12+ | 🔒 Locked | 1 codebase iOS+Android, first-class RTL, sensors, offline |
| Web (Owner/Admin) | **Next.js (React)** | Next 16 · React 19 · TS 5.x | 🔒 Locked | data-dense dashboards, RTL, SSR, shared TS types |
| Operator console | **Next.js (separate app)** | Next 16 | 🔒 Locked | isolated plane, separate auth |
| Backend | **NestJS (Node/TS)** | Node 24 LTS · NestJS 11+ · TS 5.x | 🔒 Locked | modular, RBAC guards, WS, jobs, end-to-end TS |
| API | **REST + OpenAPI + WebSocket** | — | 🔒 Locked | simple, cacheable, offline-friendly |
| Database | **PostgreSQL + PostGIS** | PG 18 · PostGIS 3.x | 🔒 Locked | relational + geospatial geofence |
| ORM / migrations | **Drizzle ORM + drizzle-kit** | latest | 🔒 Locked | SQL control for PostGIS + RLS |
| Cache / queue / pub-sub | **Redis + BullMQ** | Redis 7.x | 🔒 Locked | cache, jobs, WS fan-out, rate limit |
| Object storage | **S3-compatible (in-region)** | — | 🔒 Locked | proof media, exports, signed URLs |
| Auth | **Self-built JWT (jose) + argon2 + TOTP** | — | 🔒 Locked | residency + device binding + 2 planes |
| Push | **FCM (firebase-admin)** | — | 🔒 Locked | one integration → APNs + Android |
| SMS / OTP | **Unifonic or Taqnyat (KSA)** | — | ⚠️ Confirm vendor | local deliverability |
| Email | **Amazon SES / Postmark** | — | 🔒 Locked | transactional |
| Payments | **MyFatoorah** | API v2 | 🔒 Locked | KSA rail (per spec) |
| Hosting (dev + staging) | **Existing VPS (Ubuntu 24.04) + Coolify** | Hostinger VPS, shared | 🔒 Current env (S0-04) | Owner-approved; ARA Tasks isolated on the shared box |
| Hosting (production) | **KSA/GCC region cloud** | GCP Dammam / AWS Bahrain·UAE | ⚠️ Deferred + confirm certs | PDPL residency — settled before production |
| Containers / deploy | **Docker + Docker Compose (via Coolify) now; managed containers later** | — | 🔒 Locked | Compose on the VPS for dev/staging; Cloud Run / ECS at production scale |
| CI/CD | **GitHub Actions** | — | 🔒 Locked | standard |
| IaC | **Terraform** | 1.x | 🔒 Locked (production) | Deferred to the managed-cloud production phase; dev/staging use Coolify + Compose |
| Monorepo (JS) | **pnpm + Turborepo** | latest | 🔒 Locked | shared ui/types/config |
| Styling (web) | **Tailwind CSS** | v4 | 🔒 Locked | tokens map to theme |
| Observability | **Sentry + OpenTelemetry + pino** | — | 🔒 Locked | errors, tracing, logs |
| AI layer (Phase 2) | **Python microservice (FastAPI)** | 3.12+ | 🔒 Locked (P2) | Arabic NLP, separate runtime |

`⚠️` = decision depends on an external input (vendor contract / compliance certification) — see §16.

---
---

## 2. Frontend — Web (Owner/Admin + Operator console)

- **Framework:** **Next.js 16** (App Router) + **React 19** + **TypeScript 5.x**.
- **Styling:** **Tailwind CSS v4** with the design-system theme (tokens from the *UI/UX Design System*). No UI kit (MUI/AntD) — the component library is custom (`@ara/ui`).
- **Server state / data fetching:** **TanStack Query v5** (caching, retries, optimistic updates).
- **Client state:** **Zustand** (light, no Redux boilerplate).
- **Forms + validation:** **React Hook Form** + **Zod** (schemas shared with the backend).
- **i18n / RTL:** **next-intl** (AR/EN bundles) + `<html dir>` per locale; Tailwind logical utilities (`ms/me/ps/pe/text-start`).
- **Charts:** **Recharts** (dashboards).
- **Icons:** the custom set (lucide as a base, re-exported via `@ara/ui`).
- **Realtime client:** **socket.io-client**.

**Apps in the monorepo:** `apps/web` (tenant dashboard), `apps/operator` (operator console — separate build, separate auth audience).

---
---

## 3. Frontend — Mobile (Employee + Manager, one app)

- **Framework:** **Flutter 3.44+ / Dart 3.12+** (stable channel).
- **State:** **Riverpod** (testable, compile-safe).
- **Navigation:** **go_router** (deep links, guards).
- **HTTP:** **dio** (interceptors for auth/refresh/idempotency).
- **Offline / local DB:** **Drift** (SQLite) + an **outbox** table for queued check-ins/proofs (`ATT-13`, `BR-A-08`).
- **Location / geofence:** **geolocator** + **flutter_background_geolocation** (or platform geofencing) + mock-location detection.
- **Camera (live only):** **camera** plugin (gallery disabled for proof) (`PRF-09`).
- **Secure storage / device id:** **flutter_secure_storage** + device fingerprint.
- **Push:** **firebase_messaging** (FCM).
- **i18n:** **flutter_localizations** + **intl** + ARB bundles; wrap in `Directionality`; `EdgeInsetsDirectional` everywhere.
- **Models:** **freezed** + **json_serializable**.
- **Realtime:** **socket_io_client**.
- **Design:** custom widget library `ara_ui` (no Material default look leaking through).

**One app, role-aware UI** — Employee and Manager experiences are the same binary, gated by permission (`APP-01/02`).

---
---

## 4. Backend

- **Runtime:** **Node.js 24 LTS** (Active LTS; do **not** ship on Node 26 "Current" until it hits LTS in Oct 2026).
- **Framework:** **NestJS 11+** (modular monolith per *System Architecture*) + **TypeScript 5.x**.
- **API:** **REST**, documented with **OpenAPI** (`@nestjs/swagger`); **WebSocket** gateway (`@nestjs/websockets` + Socket.IO + Redis adapter).
- **Validation:** **Zod** (via `nestjs-zod`) — the same schemas the web app uses.
- **Jobs:** **BullMQ** (`@nestjs/bullmq`) on Redis for escalation/absence/recurring/dunning/thumbnails/retention.
- **Logging:** **pino** (`nestjs-pino`), structured JSON.
- **Config/secrets:** `@nestjs/config` reading from the cloud **secret manager** (never committed).
- **Module boundaries** enforced in CI (dependency checks) so the monolith stays modular.
- **Operator plane** = a **separate NestJS service** (separate deployable, token audience, no direct tenant-DB access — break-glass API only).

---
---

## 5. Data Layer

- **Database:** **PostgreSQL 18** + **PostGIS 3.x** (geofence: `geography(Point/Polygon,4326)`, `ST_DWithin`/`ST_Covers`).
- **ORM:** **Drizzle ORM** + **drizzle-kit** migrations. *Chosen over Prisma* for direct SQL control (PostGIS geography types, **RLS** policies, tuned queries). Prisma is the fallback if the team prioritizes DX over control.
- **Multi-tenancy:** shared DB + `tenant_id` + **Row-Level Security** (set `app.tenant_id` per request) as the backstop under the app scope engine.
- **Cache / broker:** **Redis 7.x** (managed) — permissions cache, rate-limit, WS pub/sub, BullMQ.
- **Reporting:** materialized views + a **read replica** for heavy reports at MVP; warehouse later (Phase 3).

---
---

## 6. Auth

Self-built (residency + custom device binding + two planes):
- **JWT:** **jose** — short-lived access token (`user_id`, `tenant_id`, audience `tenant|operator`) + **rotating, revocable refresh tokens** (stored, hashed).
- **Passwords:** **argon2**.
- **2FA/TOTP:** **otplib** (mandatory for operators, optional for Owner/Admin P2).
- **OTP-SMS:** via the SMS vendor (§9).
- **Permissions resolved per request** (cached in Redis) — never baked into the token, so revocation is instant.
- **Device binding** on the refresh token + device record.

---
---

## 7. Realtime

- **Server:** **Socket.IO** in NestJS with the **Redis adapter** (horizontal scale).
- **Clients:** `socket.io-client` (web), `socket_io_client` (Flutter).
- **Channels:** scoped per tenant + user/role → `notifications`, `attendance:live:{branch}`, `approvals:inbox`.

---
---

## 8. Storage & Media

- **Object storage:** **S3-compatible**, in-region bucket (proof photos/videos, exports, documents).
- **Uploads:** **pre-signed PUT URLs** (device → storage directly; API never proxies media). SDK: **AWS SDK v3** (`@aws-sdk/client-s3`, `s3-request-presigner`).
- **Downloads:** short-lived pre-signed GET URLs.
- **Thumbnails:** **sharp** (Node worker job).
- **Encryption:** SSE at rest + TLS; **lifecycle rules** enforce PDPL retention.

---
---

## 9. Notifications

- **Push:** **FCM** via **firebase-admin** (routes to APNs for iOS).
- **SMS / OTP:** **Unifonic** or **Taqnyat** (KSA deliverability) — `⚠️` pick one at contract stage; Twilio as fallback.
- **Email:** **Amazon SES** (or Postmark) for billing, escalations, reports.
- **WhatsApp (Phase 2):** WhatsApp Business API via the SMS vendor or Meta.
- **In-app:** stored in Postgres, delivered live over WebSocket.

---
---

## 10. Payments

- **MyFatoorah** (API v2): checkout initiation + **webhook** (signature-verified) drives account-state transitions (`BR-B-01`).
- **ZATCA e-invoicing (Phase 2):** a dedicated invoicing service integrating the Fatoora/ZATCA API.

---
---

## 11. DevOps, Infrastructure & Hosting

**Dev + staging today (owner-approved, `S0-04`):** run on the **existing Hostinger VPS** (Ubuntu 24.04) under **Coolify + Docker Compose**, reusing the S0-03 images. **PostgreSQL 18 + PostGIS, Redis, and MinIO (S3-compatible) are self-hosted** as containers and kept **private** (internal Docker network only); only the apps (api, web, operator) are exposed through Coolify's reverse proxy, each on its own domain. The two-plane security boundary is preserved (tenant vs operator = separate services + domains). ARA Tasks is isolated on the shared VPS and does not alter other projects. See [`deploy/vps/`](../../deploy/vps/) and `docs/state/DECISIONS.md`.

**Production (deferred managed-cloud evolution path — *not* the current environment):**
- **Containers:** **Docker** (base images pinned: `node:24-*`, official Postgres+PostGIS).
- **Compute:** managed container service — **Cloud Run** (GCP) or **ECS/Fargate** (AWS). Full Kubernetes only when scale demands.
- **Managed data:** managed **PostgreSQL 18** (with PostGIS) + managed **Redis** + object storage, all in-region.
- **Hosting region (`⚠️` compliance-driven):** **GCP Dammam (KSA)** or **AWS Bahrain (me-south-1) / UAE (me-central-1)**; a local KSA provider if a client demands in-Kingdom certification. **Confirm the region carries the PDPL/compliance certs the client requires before locking.**
- **IaC:** **Terraform** provisions the managed production infra. *Infra access (DB/servers/backups) is governed by cloud IAM — separate from and tighter than app RBAC.*

**Both phases:**
- **CI/CD:** **GitHub Actions** — lint → typecheck → test → build → migrate → deploy (dev → staging → prod).
- **Secrets:** never in code or committed env files. Dev/staging = **Coolify's encrypted environment**; production = cloud **Secret Manager** (GCP/AWS) or **Vault**.

---
---

## 12. Testing

| Target | Unit / Integration | E2E |
|---|---|---|
| Backend (NestJS) | **Jest** (or Vitest) + Supertest | contract tests on OpenAPI |
| Web (Next.js) | **Vitest** + React Testing Library | **Playwright** (AR-RTL & EN-LTR runs) |
| Mobile (Flutter) | **flutter_test** + **mocktail** | **integration_test** |
| API contract | schema tests (Zod) shared FE/BE | — |

**Quality gates in CI:** typecheck, lint, unit tests, and a **bilingual screenshot check** (every screen in `ar-RTL` and `en-LTR`) before merge.

---
---

## 13. Tooling, Monorepo & Shared Packages

- **JS monorepo:** **pnpm workspaces + Turborepo**.
  - `apps/`: `web`, `operator`, `api`, `operator-api`
  - `packages/`: **`@ara/ui`** (component library), **`@ara/types`** (Zod schemas + shared types = one API contract), **`@ara/config`** (eslint/tsconfig/tailwind preset)
- **Flutter:** separate repo (or `melos` workspace) with `ara_ui` and `ara_core` packages.
- **Lint/format:** ESLint + Prettier (JS/TS), `dart analyze` + `dart format` (Flutter). **Module-boundary linting** (dependency-cruiser / eslint-plugin-boundaries) fails the build on illegal cross-module imports.
- **Commit hygiene:** Husky + lint-staged + Conventional Commits.

---
---

## 14. Observability & Security

- **Errors:** **Sentry** (web, mobile, backend).
- **Tracing/metrics:** **OpenTelemetry** → Grafana/Prometheus (or a managed APM).
- **Logs:** **pino** structured JSON, centralized.
- **Audit:** append-only `audit_logs` (DB-enforced), dual-audit for operator break-glass.
- **Security baseline:** TLS everywhere, encryption at rest, `tenant_id` + RLS isolation, per-request server-side RBAC, rate limiting, input validation (Zod), signed URLs, dependency scanning (Dependabot/Snyk), least-privilege service accounts, mandatory 2FA for operators.

---
---

## 15. Key Install Manifests (essentials)

**Backend / API (`apps/api/package.json` — key deps):**
```jsonc
{
  "engines": { "node": ">=24 <25" },
  "dependencies": {
    "@nestjs/core":"^11", "@nestjs/websockets":"^11", "@nestjs/swagger":"^11",
    "@nestjs/bullmq":"^11", "@nestjs/config":"^11",
    "drizzle-orm":"latest", "postgres":"latest",
    "bullmq":"latest", "ioredis":"latest",
    "socket.io":"latest", "@socket.io/redis-adapter":"latest",
    "jose":"latest", "argon2":"latest", "otplib":"latest",
    "zod":"latest", "nestjs-zod":"latest", "nestjs-pino":"latest",
    "firebase-admin":"latest", "@aws-sdk/client-s3":"latest", "@aws-sdk/s3-request-presigner":"latest",
    "sharp":"latest"
  },
  "devDependencies": { "drizzle-kit":"latest", "typescript":"^5", "jest":"latest", "supertest":"latest" }
}
```

**Web (`apps/web/package.json` — key deps):**
```jsonc
{
  "dependencies": {
    "next":"^16", "react":"^19", "react-dom":"^19",
    "@tanstack/react-query":"^5", "zustand":"latest",
    "react-hook-form":"latest", "zod":"latest", "@hookform/resolvers":"latest",
    "next-intl":"latest", "recharts":"latest", "socket.io-client":"latest",
    "tailwindcss":"^4"
  },
  "devDependencies": { "typescript":"^5", "vitest":"latest", "@playwright/test":"latest" }
}
```

**Mobile (`pubspec.yaml` — key deps):**
```yaml
environment: { sdk: '>=3.12.0 <4.0.0', flutter: '>=3.44.0' }
dependencies:
  flutter_riverpod: ^2
  go_router: ^14
  dio: ^5
  drift: ^2
  geolocator: ^13
  camera: ^0.11
  flutter_secure_storage: ^9
  firebase_messaging: ^15
  socket_io_client: ^3
  intl: ^0.19
  freezed_annotation: ^2
  json_annotation: ^4
dev_dependencies:
  build_runner: ^2
  freezed: ^2
  drift_dev: ^2
  mocktail: ^1
```
> Pin exact versions at init; ranges shown for orientation.

---
---

## 16. Finalized vs Open Decisions

**Finalized (🔒):** Flutter mobile, Next.js web, NestJS backend, Postgres+PostGIS, Drizzle ORM, Redis+BullMQ, S3 storage, self-built auth, FCM push, MyFatoorah, Turborepo+pnpm, Tailwind v4, testing stack, observability. **Dev + staging hosting** = the existing VPS + Coolify + Docker Compose (owner-approved, `S0-04`).

**Open — need an external input (⚠️):**
1. **Production hosting region** — confirm which KSA/GCC region carries the exact PDPL/compliance certs the target clients require. *The most important open item; it blocks nothing in code (dev + staging already run on the VPS) but must be settled before production.* Managed cloud + Terraform are the deferred production evolution path onto this region.
2. **SMS vendor** — Unifonic vs Taqnyat: pick at contract stage on price + deliverability + OTP support.
3. **ORM** — Drizzle is locked; revisit only if the team's DX strongly favors Prisma and PostGIS/RLS needs are met via raw SQL.

---
---

## 17. Version & Upgrade Policy

- **Production runs LTS/stable only.** Node **24 LTS** now (migrate toward 26 after it enters LTS in **Oct 2026**); Postgres **18** (evaluate **19** after its Sep 2026 GA + a stabilization window); Next **16** (stay on the current LTS line); Flutter **stable channel** only.
- **Pin exact versions** in lockfiles + Docker base images; upgrade deliberately, never float `latest` in production.
- **Renovate/Dependabot** for automated dependency PRs; security patches applied promptly.
- **Node release note:** from Oct 2026 Node moves to one major/year and every release becomes LTS — plan the upgrade cadence around the April/October rhythm.

---

*This finalizes the stack. Next in the chain: the **prioritized backlog / sprint plan** — the first buildable increment (auth + tenant + org + RBAC → attendance → tasks + proof → approvals → reports) mapped onto exactly these tools.*
