# ARA Tasks — Task Breakdown

**Purpose:** Convert the *Implementation Roadmap* into small, executable tasks ready to become tickets. Phases 0–1 (what you start immediately) are broken to ticket level; later phases are lighter (epic → task groups) on purpose — they'll be refined closer to the time.

**Conventions**
- **ID:** `S<sprint>-<n>` (e.g. `S0-13`). Stable, traceable.
- **Area tags:** `infra` · `be` (backend) · `web` · `mob` (Flutter) · `ui` (design system) · `sec` · `qa`.
- **Size:** default a task is **≤ 1–2 days**. If it's bigger, split it.
- **"Done when"** is the acceptance line — the ticket isn't closed until it's true.
- Each task inherits the security/validation/audit controls from *Security Design* (not repeated per ticket).

**Start-here (first 5 tickets):** `S0-01 → S0-03 → S0-04 → S0-05 → S0-09`. Repo + Docker + infra + CI + DB pipeline, in that order.

---
---

# PHASE 0 — Foundations & Skeleton (Sprint 0)

### Repo, infra, CI
| ID | Task | Area | Done when |
|---|---|---|---|
| S0-01 | Init monorepo (pnpm + Turborepo): `apps/api,web,operator`, `packages/@ara/ui,types,config` | infra | `pnpm i` + `turbo build` pass; shared tsconfig/eslint/prettier |
| S0-02 | Scaffold Flutter app + `ara_ui`, `ara_core` packages | mob | app runs on iOS+Android sim |
| S0-03 | Dockerfiles (`node:24` pinned) + local `docker-compose` (postgres+postgis, redis, minio) | infra | `docker compose up` gives a full local stack |
| S0-04 | Terraform base infra in-region: managed PG+PostGIS, Redis, private bucket, secret manager | infra | `terraform apply` provisions dev env |
| S0-05 | GitHub Actions CI: lint→typecheck→test→build→migrate→deploy dev/staging | infra | merge to main deploys to staging |
| S0-06 | Config + secret-manager wiring; zero secrets in code/env-in-git | infra·sec | app reads all secrets from the manager |
| S0-07 | Observability baseline: Sentry + pino structured logs (api/web/mobile) | infra | errors + logs visible in dashboards |
| S0-08 | Edge security: headers (CSP/HSTS/…), CORS allow-list, Redis rate-limit middleware | sec | headers present; limits enforced |

### Tenancy & DB
| ID | Task | Area | Done when |
|---|---|---|---|
| S0-09 | Drizzle setup + `drizzle-kit` migration pipeline + base migration | be | migrations run in CI |
| S0-10 | `tenants` table + tenant-context middleware (set `app.tenant_id` per request) | be | tenant resolved from token |
| S0-11 | Enable **RLS** + `tenant_isolation` policy pattern | be·sec | cross-tenant query test returns nothing |

### Auth
| ID | Task | Area | Done when |
|---|---|---|---|
| S0-12 | Tables: `users, user_credentials, refresh_tokens, otp_codes, devices` | be | migrated |
| S0-13 | Password login (argon2id) + access JWT (jose/EdDSA, 10–15m TTL) | be·sec | valid login returns access token |
| S0-14 | Rotating refresh tokens + reuse detection + session revocation | be·sec | reused token revokes session family |
| S0-15 | OTP-SMS request/verify (hashed, TTL, max attempts) + SMS adapter (sandbox) | be | OTP login works in sandbox |
| S0-16 | Device registration/binding + one-bound-device constraint | be | 2nd device → pending_rebind |
| S0-17 | Password reset / recovery flow | be | reset works end-to-end |
| S0-18 | Operator auth (separate audience) + TOTP enrollment (otplib) | be·sec | operator token rejected on tenant API |

### RBAC
| ID | Task | Area | Done when |
|---|---|---|---|
| S0-19 | Tables: `permissions, roles, role_permissions, role_assignments` + seed registry | be | permission catalog seeded |
| S0-20 | Seed 8 default roles per tenant on provisioning | be | new tenant has editable default roles |
| S0-21 | AuthGuard + PermissionGuard (deny-by-default) | be·sec | unpermitted request → 403 |
| S0-22 | Scope engine (company⊃branch⊃dept⊃team⊃self) + Redis cache + invalidation | be | scoped permission resolves; edit takes effect instantly |

### Design system & shells
| ID | Task | Area | Done when |
|---|---|---|---|
| S0-23 | `@ara/ui` tokens + primitives (Button, TextField, StatusPill, Card, FormField) | ui | rendered in a Storybook/gallery |
| S0-24 | `ara_ui` Flutter tokens + primitives mirror | ui·mob | parity with web primitives |
| S0-25 | Bilingual/RTL shell: next-intl + `dir` + logical props (web); Directionality + intl (mobile); `Wordmark` | web·mob | AR-RTL ⇄ EN-LTR toggle works |
| S0-26 | Web app shell (RTL/LTR sidebar + topbar) + Auth screens | web | login/OTP screens live |
| S0-27 | Mobile app shell (app bar + bottom nav) + Auth + Consent screens | mob | login/OTP/consent live |
| S0-28 | Test harness (Jest/Vitest/flutter_test) + bilingual screenshot gate + Playwright skeleton | qa | CI runs the gates |

**Sprint 0 DoD:** invite → login (web+mobile, AR/EN) → a scoped permission enforced server-side; RLS proven; CI deploys to staging.

---
---

# PHASE 1 — Core Loop (MVP)

## Sprint 1 — Organization & Users
| ID | Task | Area | Done when |
|---|---|---|---|
| S1-01 | `branches` + PostGIS (`center/radius/boundary`) + GiST index | be | geofence stored |
| S1-02 | Branch CRUD + geofence helper (`ST_DWithin`/`ST_Covers`) | be | point-in-zone check works |
| S1-03 | `departments` + `department_branches` + `teams` + CRUD | be | cross-branch dept supported |
| S1-04 | `reporting_edges` + partial-unique primary + assign/set-primary/remove | be | matrix + one primary enforced |
| S1-05 | Users CRUD + org/manager assignment endpoints | be | user placed in scope |
| S1-06 | Invitations (link/SMS) + accept endpoint | be | invited user activates |
| S1-07 | Roles CRUD + `PUT /roles/:id/permissions` | be | custom role created |
| S1-08 | Role-assignment (scoped) + effective-permissions endpoint | be | union resolves per scope |
| S1-09 | Web: Branches list + detail with **GeofenceEditor** (map + radius) | web | geofence drawn & saved |
| S1-10 | Web: Employees list (search/filter) + invite modal (role+scope) | web | invite from UI |
| S1-11 | Web: **Roles & Permissions matrix** (custom checkbox grid) | web·ui | edit role permissions visually |
| S1-12 | UI: Select, Checkbox, Switch, Modal/Sheet, DataTable | ui | in gallery, used by S1-09..11 |
| S1-13 | QA: RBAC scope + cross-tenant tests across hierarchy | qa | tests green |

## Sprint 2 — Shifts & Attendance
| ID | Task | Area | Done when |
|---|---|---|---|
| S2-01 | `shifts, shift_patterns, shift_assignments, overtime_rules, holidays` + CRUD | be | shifts assignable |
| S2-02 | Web: Shifts management + **TimePicker** | web·ui | shift created from UI |
| S2-03 | `attendance_sessions, attendance_absences, attendance_corrections` tables | be | migrated |
| S2-04 | **Check-in** endpoint: ordered gate (consent→device→gps/mock→geofence→late) | be·sec | invalid states blocked with codes |
| S2-05 | Check-out endpoint + early-departure flag | be | session closes |
| S2-06 | Jobs: lateness/absence scan (cron) + missed-checkout auto-close | be | flags fire on schedule |
| S2-07 | Offline sync endpoint (batch + idempotency) + retroactive validation + conflict flags | be | replayed events validated, conflicts surfaced |
| S2-08 | Attendance timeline + correction request/decision endpoints | be | correction approved/rejected |
| S2-09 | WebSocket gateway (Socket.IO + Redis adapter) + "who's in now" endpoint | be | live presence streams |
| S2-10 | Mobile: **My Day** screen | mob | shift + tasks preview + check-in CTA |
| S2-11 | Mobile: **Check-in** (GeofenceRing + geolocator + mock detection + camera perms + consent) | mob | check-in only inside geofence on bound device |
| S2-12 | Mobile: offline outbox (Drift) + sync + "pending sync" + offline banner | mob | works with no signal |
| S2-13 | Mobile: attendance timeline + correction request | mob | request sent |
| S2-14 | Web: live presence board (WS) + KPI (present/expected/absent) | web | updates in real time |
| S2-15 | UI: **GeofenceRing**, **DatePicker (Hijri+Greg)**, InlineAlert | ui | in gallery |
| S2-16 | QA: geofence/device/offline test matrix | qa | matrix green |

## Sprint 3 — Tasks & Proof
| ID | Task | Area | Done when |
|---|---|---|---|
| S3-01 | `task_series, tasks, checklist_items, task_comments, task_tags` tables | be | migrated |
| S3-02 | Tasks CRUD + assignment + priority/deadline/location-bound + **state machine** + reassign | be | legal transitions only |
| S3-03 | Jobs: recurring generation (nightly) + overdue flag | be | instances generated |
| S3-04 | `proofs` + **pre-signed upload URL** (type/size) + register metadata | be·sec | direct-to-storage upload |
| S3-05 | Required-proof **submission gate** + submit + gallery + signed GET | be | can't submit without required proof |
| S3-06 | Thumbnail job (sharp) | be | thumbs generated |
| S3-07 | Mobile: Tasks list + Task detail (checklist + **ProofUploader** live-camera + GPS stamp) | mob | proof captured & submitted |
| S3-08 | Web: Tasks board/list + create + recurring editor + checklist builder | web | manager creates recurring task |
| S3-09 | UI: ProofUploader, ProofThumb (verified seal), TaskCard, Checklist item | ui | in gallery |
| S3-10 | QA: proof gate + lifecycle transition tests | qa | tests green |

## Sprint 4 — Approvals, Escalation & Notifications
| ID | Task | Area | Done when |
|---|---|---|---|
| S4-01 | `decisions` + approve/reject (reason) + **first-decision-wins** state guard | be·sec | concurrent decision → one wins |
| S4-02 | Approval inbox endpoint (scoped) | be | pending items listed in scope |
| S4-03 | `escalations` + escalation engine (timers→primary→fan-out) jobs | be | unattended item escalates |
| S4-04 | `notifications, notification_preferences` tables | be | migrated |
| S4-05 | Notification pipeline: event→scope recipients→channels + quiet-hours | be | correct people notified |
| S4-06 | FCM integration (firebase-admin) + device token registration | be | push delivered |
| S4-07 | Email (SES) transactional | be | emails sent |
| S4-08 | Mobile: Approvals inbox + detail (ApprovalCard) + reject ConfirmDialog | mob | approve/reject from phone |
| S4-09 | Mobile: notification center + push handling | mob | tap → deep link |
| S4-10 | UI: ApprovalCard, Toast, ConfirmDialog, notification list | ui | in gallery |
| S4-11 | QA: first-decision-wins concurrency + escalation timing tests | qa | tests green |

## Sprint 5 — Reports, Dashboards & Audit
| ID | Task | Area | Done when |
|---|---|---|---|
| S5-01 | `audit_logs` (append-only) + audit interceptor on sensitive actions | be·sec | actions logged immutably |
| S5-02 | Read models / materialized views (attendance_daily, task_completion, proof_coverage) + read replica | be | views refresh |
| S5-03 | Dashboard endpoints (owner/manager/me) + KPI aggregation | be | KPIs returned |
| S5-04 | Reports endpoints (attendance/tasks/branch compare) + drill-down | be | drill company→branch→employee |
| S5-05 | Export job (PDF/Excel/CSV) + `report_exports` + signed download | be | export downloadable |
| S5-06 | Audit log viewer endpoint (filter) | be | filter by actor/resource/date |
| S5-07 | Web: **Overview** (KPITiles + branch-compare table + attention panel) | web | matches the approved mockup |
| S5-08 | Web: reports pages + export modal + audit viewer | web | export + audit visible |
| S5-09 | Mobile: manager reports summary | mob | scoped KPIs shown |
| S5-10 | UI: KPITile, sortable DataTable, charts (Recharts) | ui | in gallery |
| S5-11 | QA: report accuracy + export tests | qa | numbers verified |

**Phase 1 DoD (core loop):** assign → check-in (verified) → do + prove → approve → report, end-to-end, on real data.

---
---

# PHASE 2 — Monetize & Operate

## Sprint 6 — Billing
| ID | Task | Area | Done when |
|---|---|---|---|
| S6-01 | `subscriptions, invoices, payments` + account lifecycle state machine | be | states transition |
| S6-02 | MyFatoorah checkout endpoint | be | payment URL returned |
| S6-03 | MyFatoorah webhook (signature verify) → state transitions + event | be·sec | payment updates account |
| S6-04 | Dunning/retry jobs + grace→suspension | be | failed payment → grace → suspend |
| S6-05 | Per-seat counting + `billing:view/manage` endpoints | be | seats billed correctly |
| S6-06 | Web: Billing (plans, invoices table, checkout, account-state banner) | web | subscribe from UI |
| S6-07 | Access gating by account state (suspended blocks operational) | be·sec | suspended tenant blocked |
| S6-08 | QA: lifecycle + webhook + gating tests | qa | tests green |

## Sprint 7 — Operator Console
| ID | Task | Area | Done when |
|---|---|---|---|
| S7-01 | Operator service scaffold (separate deployable + audience + 2FA) | be·sec | isolated from tenant plane |
| S7-02 | `operators, platform_roles, operator_role_assignments, platform_audit_logs` | be | migrated |
| S7-03 | Tenant directory + provisioning (+region) + lifecycle + offboard (deletion workflow) | be | provision/suspend/terminate |
| S7-04 | Plans + feature-flags management | be | flags toggle per tenant |
| S7-05 | **Impersonation** (consent+TTL+read-only+dual-audit) + in-tenant banner | be·sec | session time-boxed & logged both sides |
| S7-06 | Platform billing (cross-tenant) + staff/roles + platform audit endpoints | be | operator sees revenue |
| S7-07 | Operator web console screens (directory, provision, tenant detail, plans, flags, billing, audit) | web | operator can run the SaaS |
| S7-08 | QA: isolation + impersonation dual-audit tests | qa·sec | no default tenant-data access |

---
---

# PHASE 3 — Launch Hardening (Sprint 8) → **LAUNCH**

| ID | Task | Area | Done when |
|---|---|---|---|
| S8-01 | Run Pre-Launch Security Checklist; file + fix findings | sec | checklist all ✅ |
| S8-02 | Third-party **penetration test** + remediation | sec | critical/high closed |
| S8-03 | Localization QA (all screens AR-RTL/EN-LTR; Hijri/prayer/Ramadan; `ARA Tasks` wordmark) | qa | both directions clean |
| S8-04 | PDPL: consent flows, retention/purge jobs, residency verified, data-subject-request path | sec·be | compliance verified |
| S8-05 | Load/perf test hot paths (check-in, live board) + tuning | qa | targets met |
| S8-06 | Accessibility pass (targets, contrast, focus, SR labels) | qa | a11y checks pass |
| S8-07 | App Store + Google Play submission (assets, privacy labels, review) | mob | apps approved |
| S8-08 | Production infra + monitoring/alerts + runbooks + backup-restore test | infra | prod live, alerts wired |
| S8-09 | First-tenant onboarding polish + seed/import | be·web | pilot tenant onboarded |

**MVP LAUNCH gate:** security + pen-test + in-region + stores approved + a paying tenant runs the full loop.

---
---

# PHASE 4 — Intelligence & Compliance (epic-level, refine later)

**Sprint 9 — AI layer** (`AI-01…08`): Python FastAPI service scaffold · Arabic NLP · assistant Q&A · auto daily digest · attendance anomaly detection · early-warning signals · AI config/toggle per tenant · guardrails + rate limits.

**Sprint 10 — Face verification** (`ATT-15/16`, `LOC-11`): consent capture · enrollment · **template storage (not images)** · verify at check-in · per-tenant toggle · opt-out path · audit.

**Sprint 11 — ZATCA e-invoicing** (`BIL-10`): Fatoora integration · compliant invoice fields (`zatca_uuid`) · submission/clearance · retry/error handling.

**Sprint 12 — Channels & smart tasks** (`NOT-09/10`, `TSK-13…18`, `SHF-10/11`): SMS + WhatsApp channels · smart task distribution · NL task creation · task templates + bulk assign · leave requests + shift swaps.

---
---

# PHASE 5 — Scale & Expansion (epic-level)

- **Scale:** multi-region deploy · dedicated DB/cluster for large tenants · partition hot tables (`attendance_sessions`, `audit_logs`).
- **Analytics:** warehouse mirror · predictive staffing/analytics (`RPT-16/17`, `SHF-12`).
- **Platform:** public API + webhooks for tenants (`APP-08`) · reseller/white-label (`PLT-23/24`, `APP-12`).
- **Markets:** broader Gulf/MENA localization (`LOC-13/14`) · multi-currency (`BIL-13`).

---
---

# Working Agreements (apply to every ticket)

- **Definition of Ready:** scope clear, dependencies unblocked, acceptance written.
- **Definition of Done:** code + tests (unit/integration) + bilingual screenshot (UI) + audit logging (sensitive) + docs/OpenAPI updated + reviewed + deployed to staging.
- **Every mutating endpoint** ships with its auth + scope guard + Zod validation + audit entry — no exceptions.
- **Every screen** composes `@ara/ui` / `ara_ui` — no one-off styling; passes AR-RTL & EN-LTR.
- **Split anything > 2 days.** Keep tickets shippable.

---

*This is the last planning artifact. From here it's execution: create the Sprint 0 tickets from the table above and start committing.*
