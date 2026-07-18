# ARA Tasks — Implementation Roadmap

**Purpose:** Turn the full design set into an ordered, buildable plan. It splits delivery into **phases → sprints**, each with a clear goal, scope (mapped to feature IDs, tables, and endpoints), and a definition of done. This is the bridge from documentation to code.

**Assumptions:** 2-week sprints; a small team (≈2–4 engineers) working the modular monolith + Flutter app + Next.js web; the *Tech Stack Finalization* is locked. Timelines are indicative — adjust to real capacity.

**Ordering principle:** build the **skeleton before the muscles** — tenancy, auth, org, and RBAC first (everything depends on them), then the core loop (attendance → tasks → proof → approvals), then the payoff (reports, billing), then intelligence and scale.

---

## Phase Overview

| Phase | Theme | Sprints | Outcome |
|---|---|---|---|
| **0** | Foundations & platform skeleton | 0 | Repos, CI/CD, tenancy, auth, RBAC engine running |
| **1** | Core loop — MVP | 1–5 | Attendance → tasks → proof → approvals → reports live |
| **2** | Monetize & operate | 6–7 | Billing + operator console → sellable, runnable SaaS |
| **3** | Launch hardening | 8 | Security, localization polish, pen-test → **public launch** |
| **4** | Intelligence & compliance | 9–12 | AI layer, face verification, ZATCA, SMS/WhatsApp |
| **5** | Scale & expansion | 13+ | Multi-region, dedicated tenants, resellers, analytics |

**MVP = end of Phase 3** (Sprints 0–8). Everything after is fast-follow/expansion.

---
---

# PHASE 0 — Foundations & Platform Skeleton

### Sprint 0 — Groundwork
**Goal:** a running, secured, multi-tenant skeleton nobody has to redo later.

**Deliverables**
- Monorepo (pnpm + Turborepo): `apps/api`, `apps/web`, `apps/operator`, `packages/@ara/ui|types|config`; Flutter app scaffold.
- CI/CD (GitHub Actions): lint → typecheck → test → migrate → deploy to **dev + staging**; Docker base images pinned. **Dev + staging run on the existing VPS via Coolify + Docker Compose** — self-hosted Postgres+PostGIS, Redis, and MinIO (S3-compatible), with data services kept private and only the apps exposed through Coolify's proxy. Managed cloud (managed Postgres/Redis/object storage + secret manager) and Terraform are a **deferred production** evolution path, not the current environment — see `docs/state/DECISIONS.md`.
- **Tenancy:** `tenants` + `tenant_id` on every table + **RLS** wired (`app.tenant_id` per request).
- **Auth:** login (phone/email + password), **OTP-SMS**, JWT (jose) + **rotating refresh + reuse detection**, argon2, device registration/binding, sessions. Operator plane auth stub with 2FA.
- **RBAC engine:** permission registry, default roles seeded per tenant, `role_assignments` (scoped), the two request guards, per-request resolution cached in Redis.
- **`@ara/ui` starter:** tokens + core primitives (Button, TextField, StatusPill, Card) in React; `ara_ui` mirror in Flutter; bilingual/RTL shell.
- Observability baseline (Sentry, pino), secret manager, rate-limit middleware.

**DoD:** a user can be invited, log in on web and mobile in AR-RTL and EN-LTR, and a scoped permission is enforced server-side; RLS blocks cross-tenant access (proven by a test). CI deploys to staging on merge.

**Depends on:** *Tech Stack*, *Security Design*, *Database Design*, *Roles & Permissions*.

---
---

# PHASE 1 — Core Loop (MVP)

### Sprint 1 — Organization & Users
**Goal:** the company can model its real structure.

**Scope:** `ORG-01…11`, `USR-01…12`, `RBAC-01…10`.
- Branches (with **PostGIS geofence** — center+radius/polygon, working hours), departments (cross-branch), teams.
- Reporting hierarchy + matrix + **Primary Manager** (`reporting_edges`).
- Users CRUD, invitations, org/manager assignment, device binding UX.
- Roles UI (default + custom), scoped role assignment.
- **Endpoints:** `/branches`, `/departments`, `/teams`, `/org/reporting`, `/users`, `/invitations`, `/roles`, `/role-assignments`.
- **Screens:** web — Branches (+geofence editor), Employees (+invite), Roles & Permissions matrix.

**DoD:** an Owner sets up a full org (branches/depts/teams/shifts-ready), invites employees, assigns scoped roles; permissions resolve correctly across the hierarchy.

### Sprint 2 — Shifts & Attendance
**Goal:** trusted, presence-verified check-in — the product's heart.

**Scope:** `SHF-01…09`, `ATT-01…14`, business rules `BR-A-*`, `BR-V-*`.
- Shifts, patterns, grace, weekend/holidays.
- **Check-in/out** with the ordered validation gate: consent → device → GPS/mock → geofence → on-time/late.
- Lateness/absence/early-departure/missed-checkout jobs (BullMQ cron).
- **Offline capture + sync** with retroactive validation + conflict flagging.
- Attendance timeline; **"who's in now"** live board (WebSocket).
- Correction request + approval.
- **Endpoints:** `/shifts`, `/shift-assignments`, `/attendance/*`.
- **Screens:** mobile — My Day, Check-in (GeofenceRing), attendance timeline; web — live board.

**DoD:** an employee checks in only when inside the geofence on the bound device; late/absent flags fire; offline check-in syncs and flags conflicts; a manager sees live presence.

### Sprint 3 — Tasks & Proof
**Goal:** assign work and prove it's done.

**Scope:** `TSK-01…12`, `PRF-01…09`, `BR-T-*`, `BR-P-*`.
- One-time + recurring tasks, checklists, priority, deadline, location-bound, reassignment, overdue job.
- **Proof:** pre-signed upload (live camera), GPS/time stamp, required-proof gate, gallery, verified seal.
- Task lifecycle state machine (open→in_progress→submitted→…).
- **Endpoints:** `/tasks`, `/task-series`, `/proofs/*`.
- **Screens:** mobile — Tasks, Task detail + ProofUploader; web — Tasks board + create/recurring editor.

**DoD:** a manager creates a recurring task; an employee completes the checklist, attaches live-camera proof, and can't submit without required proof; the task reaches `submitted`.

### Sprint 4 — Approvals & Escalation
**Goal:** close the loop — work becomes *done*, and problems escalate same-day.

**Scope:** `APR-01…08`, `BR-D-*`, `BR-E-*`, `NOT-01…08`.
- Approve/reject (+reason, reopen), **first-decision-wins** locking, approval inbox.
- Escalation engine (timers → primary line → fan-out) via jobs.
- Notifications: push (FCM) + in-app center + email; event → recipient (scope) → channel; quiet-hours rules.
- **Endpoints:** `/approvals/inbox`, `/tasks/:id/decision`, `/attendance/corrections/:id/decision`, `/notifications/*`.
- **Screens:** mobile — Approvals inbox/detail; notification center.

**DoD:** a submitted task is approved/rejected from a manager's phone (first decision locks); unattended items escalate and notify up the chain; all decisions hit the audit log.

### Sprint 5 — Reports & Dashboards
**Goal:** the owner's payoff — visibility without chasing.

**Scope:** `RPT-01…12`, `AUD-01…05`.
- Owner/Manager/Employee dashboards; attendance & task reports; on-time %, proof %, branch comparison, drill-down; exports (PDF/Excel/CSV).
- Audit log viewer.
- **Endpoints:** `/dashboards/*`, `/reports/*`, `/exports`, `/audit`.
- **Screens:** web — Overview, reports, branch compare, audit; mobile — manager reports summary.

**DoD:** the Owner opens one dashboard and sees company-wide KPIs, compares branches on real data, drills to an employee, and exports — end of the **core loop**.

---
---

# PHASE 2 — Monetize & Operate

### Sprint 6 — Billing & Subscriptions
**Scope:** `BIL-01…09`, `BR-B-*`.
- Plans (from operator), trial, account lifecycle (trial→active→grace→suspended), **MyFatoorah** checkout + signed webhook, per-seat, invoices, dunning.
- **Endpoints:** `/billing/*`.
- **Screens:** web — Billing (plan, invoices, checkout, account-state banner).

**DoD:** a tenant subscribes via MyFatoorah, a failed payment triggers grace→suspension correctly, and access gates by account state.

### Sprint 7 — Operator Console
**Scope:** `PLT-01…18`.
- Operator app (separate, 2FA), tenant directory, provisioning + region assignment, lifecycle, offboarding + deletion, plan management, feature flags, platform billing, staff & roles, platform audit, and **break-glass impersonation** (consent + TTL + read-only + dual-audit + banner).

**DoD:** the operator can provision, suspend, and support a tenant; impersonation is consented, time-boxed, and visible + logged on both sides.

---
---

# PHASE 3 — Launch Hardening → **Public Launch**

### Sprint 8 — Hardening, Localization, Compliance
**Scope:** *Security Design* checklist, *Business Logic* invariants, PDPL, localization polish.
- Run the **Pre-Launch Security Checklist**; fix findings.
- **Third-party penetration test**; remediate.
- Localization QA: every screen in AR-RTL & EN-LTR; Hijri/prayer/Ramadan; `ARA Tasks` wordmark rule enforced everywhere.
- PDPL: consent flows, retention/purge jobs, data residency verified, data-subject request path.
- Load/perf test the hot paths (check-in, live board); accessibility pass.
- App Store + Google Play submission; production infra + monitoring/alerts.

**DoD (MVP LAUNCH):** passes the security checklist + pen-test, runs in-region, apps approved on both stores, a paying tenant can run the full loop end-to-end.

---
---

# PHASE 4 — Intelligence & Compliance (fast-follow)

| Sprint | Focus | Scope |
|---|---|---|
| **9** | AI layer (Python service) | `AI-01…08`: assistant, daily digest, NL task creation, anomaly detection, early-warning, Arabic NLP |
| **10** | Face verification | `ATT-15/16`, `LOC-11`: consented, templates-not-images, opt-out, toggle |
| **11** | ZATCA e-invoicing | `BIL-10`: Fatoora integration |
| **12** | SMS/WhatsApp + smart tasks | `NOT-09/10`, `TSK-13…18`, leave/shift-swap `SHF-10/11`, task templates/bulk |

**DoD:** AI early-warning flags a slipping branch before crisis; face verification runs behind a consented toggle; KSA e-invoicing is compliant.

---
---

# PHASE 5 — Scale & Expansion

- Multi-region deploy; dedicated DB/cluster for large tenants; table partitioning (`attendance_sessions`, `audit_logs`).
- Warehouse-backed analytics + predictive (`RPT-16/17`, `SHF-12`).
- Public API/webhooks (`APP-08`), reseller/white-label (`PLT-23/24`, `APP-12`), broader Gulf/MENA localization + multi-currency.

---
---

# Cross-Cutting Tracks (run every sprint)

- **Security:** each sprint applies the relevant *Security Design* controls; nothing ships without its auth/scope/validation.
- **Testing:** unit + integration + the **bilingual screenshot gate** per screen; e2e on the core loop.
- **Docs & audit:** audit logging added with each sensitive action; API/OpenAPI kept current.
- **Design system:** every new screen composes `@ara/ui` / `ara_ui` — no one-off styling.

---
---

# Milestones & Gates

| Milestone | After | Gate |
|---|---|---|
| **M0 — Skeleton** | Sprint 0 | Auth + RBAC + RLS proven; CI deploys |
| **M1 — Presence** | Sprint 2 | Trusted check-in works offline + online |
| **M2 — Core loop** | Sprint 5 | Assign → prove → approve → report end-to-end |
| **M3 — Sellable** | Sprint 7 | Billing + operator console live |
| **M4 — LAUNCH** | Sprint 8 | Security + pen-test + stores + in-region ✅ |
| **M5 — Intelligent** | Sprint 12 | AI + face + ZATCA shipped |

---
---

# Key Risks & Sequencing Notes

- **Don't reorder the foundation.** Tenancy + auth + RBAC (Sprint 0) gate everything; cutting corners here is paid back with interest.
- **Attendance (Sprint 2) is the riskiest build** (geofence + device + offline sync) — give it buffer; it's also the highest-value proof of the product.
- **Adoption risk lives in the Employee app** — keep it tap-light from Sprint 2; usability testing with real frontline users before launch.
- **Two `⚠️` externals** (hosting region certs, SMS vendor) must be resolved **before Sprint 8** — they block production, not code.
- **Face verification is deliberately Phase 4**, not MVP — it drags PDPL scope (consent + template storage + retention). Don't let a demo push it earlier without that scope.
- **AI needs data** — Phase 4 works because Phases 1–3 generate clean operational data first.

---

*This roadmap closes the design set. The immediate next artifact is a **Sprint 0 task breakdown** (issues/tickets) so the team can start committing code against these deliverables.*
