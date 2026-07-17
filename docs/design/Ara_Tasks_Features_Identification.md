# Ara Tasks — Features Identification

**Purpose:** A complete catalog of every feature required to build Ara Tasks — from the lean KSA MVP to the full-power product. This is the master reference used to shape scope, build the backlog, and trace requirements.

**How to read this document:**

- **Part 1 — MVP (Phase 1)** lists everything needed to launch the core loop in Saudi Arabia.
- **Part 2 — Full Product (Phase 2 & 3)** lists the fast-follow and expansion features.
- Both parts are organized by the same 17 modules, so a module can appear in both.
- **Modules 1–16 are the Tenant plane** (the customer's workspace). **Module 17 — Platform / Operator Console — is the Operator plane** (Ara Tasks running the SaaS itself). See *User Roles & Permissions* for the two-plane model.
- The **Traceability Check** at the end confirms every requirement in the Project Description maps to at least one feature.

---

## Legend

| Field | Meaning |
|---|---|
| **ID** | Stable feature code (`MODULE-NN`). Never reused. |
| **Feature** | Short name of the capability. |
| **Description** | One-line definition. |
| **Phase** | `1` = MVP / KSA launch, `2` = fast follow, `3` = expansion. |
| **Priority** | MoSCoW — `Must`, `Should`, `Could`. |
| **Roles** | Primary user roles that use it (`O`=Owner, `A`=Admin, `M`=Manager, `S`=Supervisor, `E`=Employee, `Au`=Auditor, `PV`=Payroll Viewer, `BM`=Billing Manager, `Sys`=System). |
| **Permissions** | Related `resource:action` keys. |
| **Notes** | Dependencies, risks, or key decisions. |

**Module prefixes:** `ORG` Organization · `USR` Users · `RBAC` Roles & Permissions · `SHF` Shifts · `ATT` Attendance · `TSK` Tasks · `PRF` Proof · `APR` Approvals · `RPT` Reports · `NOT` Notifications · `BIL` Billing · `AI` AI Layer · `AUD` Audit · `LOC` Localization & Compliance · `APP` Platform & Apps · `SET` Settings · `PLT` Platform / Operator Console.

---
---

# PART 1 — MVP (Phase 1 · KSA Launch)

> The core loop that proves the value: **who showed up, where, doing what, with proof, approved by a manager — localized for Saudi Arabia.**

## 1. Organization & Structure

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| ORG-01 | Company/Workspace setup | Create the top-level account that owns everything below it. | 1 | Must | O, A | `settings:update` | Multi-tenant root. |
| ORG-02 | Branch management | Create/edit/archive branches with GPS coordinates. | 1 | Must | O, A | `branch:manage` | Attendance happens against a branch. |
| ORG-03 | Branch geofence | Define geofence (radius/polygon) per branch. | 1 | Must | O, A | `branch:manage` | Feeds ATT-03. |
| ORG-04 | Branch working hours & timezone | Set branch hours and AST timezone. | 1 | Must | O, A | `branch:manage` | — |
| ORG-05 | Department management | Create/edit functional departments. | 1 | Must | O, A | `department:manage` | Independent axis from branch. |
| ORG-06 | Cross-branch departments | A department can span multiple branches. | 1 | Must | O, A | `department:manage` | Matrix axis (resolved decision). |
| ORG-07 | Team management | Optional working group inside branch/department. | 1 | Should | O, A, M | `team:manage` | Day-to-day assignment unit. |
| ORG-08 | Multi-level reporting chain | Employees → managers → managers above them, several levels deep. | 1 | Must | O, A | `user:update` | Powers visibility cascade. |
| ORG-09 | Matrix reporting | One employee can have multiple managers. | 1 | Must | O, A | `user:update` | e.g. branch manager + ops supervisor. |
| ORG-10 | Primary Manager | Exactly one accountable line per employee. | 1 | Must | O, A | `user:update` | Default line for payroll/escalation. |
| ORG-11 | Scope resolution engine | Resolve who can see/act on what based on hierarchy + scope. | 1 | Must | Sys | core | Foundation for all scoped permissions. |

## 2. Users & Identity

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| USR-01 | User CRUD | Create, edit, deactivate, delete users. | 1 | Must | O, A | `user:create`, `user:update`, `user:delete` | — |
| USR-02 | User invitation | Invite via link/SMS/email. | 1 | Must | O, A, M | `user:invite` | — |
| USR-03 | User profile | Contact, job title, Iqama/National ID, employment data. | 1 | Must | O, A | `user:update` | PDPL-sensitive fields. |
| USR-04 | Org assignment | Assign user to branch/department/team. | 1 | Must | O, A | `user:update` | — |
| USR-05 | Manager assignment | Assign managers + designate primary. | 1 | Must | O, A | `user:update` | Ties to ORG-09/10. |
| USR-06 | Authentication | Phone/email + password login. | 1 | Must | All | — | Phone-first for KSA. |
| USR-07 | OTP (SMS) login | One-time-code login via SMS. | 1 | Should | All | — | KSA phone-first UX. |
| USR-08 | Password reset / recovery | Self-service account recovery. | 1 | Must | All | — | — |
| USR-09 | Device binding | Bind a user to one registered device. | 1 | Must | E, M | — | Key attendance-integrity control. |
| USR-10 | Device re-bind approval | Request + approve device change. | 1 | Must | E, M, A | `user:update` | Prevents silent device swaps. |
| USR-11 | User status | Active / invited / suspended / deactivated. | 1 | Must | O, A | `user:update` | — |
| USR-12 | Employee self-profile | View and limited-edit own profile. | 1 | Should | E | — | — |

## 3. Roles & Permissions

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| RBAC-01 | Permission registry | Central catalog of all `resource:action` keys. | 1 | Must | Sys | — | Source of truth. |
| RBAC-02 | Default roles | Ship Owner, Admin, Manager, Supervisor, Employee, Auditor, Payroll Viewer, Billing Manager. | 1 | Must | O, A | `role:view` | Ready-made, editable. |
| RBAC-03 | Custom role creation | Build new roles from permission bundles. | 1 | Must | O, A | `role:create` | No developer needed. |
| RBAC-04 | Edit roles | Modify permissions inside any role. | 1 | Must | O, A | `role:update` | Defaults are not hardcoded. |
| RBAC-05 | Assign roles | Attach roles to users within a scope. | 1 | Must | O, A | `role:assign` | — |
| RBAC-06 | Scoped permission model | Evaluate every permission at company/branch/department/team/self. | 1 | Must | Sys | — | `task:approve`@branch ≠ company-wide. |
| RBAC-07 | Enforcement middleware | Backend enforcement on every request. | 1 | Must | Sys | — | Server-side, non-bypassable. |
| RBAC-08 | Permission-aware UI | Hide/disable actions the user can't perform. | 1 | Must | All | — | Mirrors RBAC-07. |
| RBAC-09 | Multiple roles per user | A user can hold several roles (stacked). | 1 | Should | O, A | `role:assign` | Union of permissions. |
| RBAC-10 | Permission change logging | Record all role/permission edits. | 1 | Must | Sys, Au | `audit:view` | Ties to AUD-04. |

## 4. Shifts & Scheduling

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| SHF-01 | Shift definition | Define start/end, breaks per shift. | 1 | Must | O, A, M | `shift:manage` | — |
| SHF-02 | Shift assignment | Assign shifts to users/teams. | 1 | Must | O, A, M | `shift:manage` | — |
| SHF-03 | Recurring shift patterns | Weekly/rotating schedules. | 1 | Must | O, A, M | `shift:manage` | — |
| SHF-04 | Lateness/grace threshold | Configurable grace period before "late". | 1 | Must | O, A | `shift:manage` | Feeds ATT-05. |
| SHF-05 | Overtime rules | Configurable OT logic per KSA labor law. | 1 | Should | O, A | `shift:manage` | Not hardcoded (LOC-16). |
| SHF-06 | Weekend = Fri–Sat | Saudi working-week default. | 1 | Must | Sys | — | Localization baseline. |
| SHF-07 | KSA holiday calendar | Public holidays baked in. | 1 | Should | O, A | `shift:manage` | — |
| SHF-08 | Prayer-time-aware shifts | Adjust schedules around prayer times. | 1 | Should | O, A | `shift:manage` | Launch localization requirement. |
| SHF-09 | Ramadan working hours | Reduced/adjusted hours mode. | 1 | Should | O, A | `shift:manage` | Launch localization requirement. |

## 5. Attendance

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| ATT-01 | Check-in / check-out | Core attendance action. | 1 | Must | E, M | `attendance:view` | — |
| ATT-02 | GPS capture | Record location at check-in/out. | 1 | Must | E | — | — |
| ATT-03 | Geofence validation | Confirm the user is inside the branch geofence. | 1 | Must | Sys | — | Uses ORG-03. |
| ATT-04 | Device-bound check-in | Validate the check-in is from the bound device. | 1 | Must | Sys | — | Stops clocking in for absent friends. |
| ATT-05 | Lateness detection | Flag late arrivals vs. shift + grace. | 1 | Must | Sys | — | — |
| ATT-06 | Absence detection | Flag no-shows against schedule. | 1 | Must | Sys | — | — |
| ATT-07 | Early-departure detection | Flag leaving before shift end. | 1 | Should | Sys | — | — |
| ATT-08 | Correction request | Employee requests an attendance fix. | 1 | Must | E | `attendance:correct` | — |
| ATT-09 | Correction approval | Manager approves/rejects the correction. | 1 | Must | M, S | `attendance:approve` | First valid decision wins (APR-04). |
| ATT-10 | Missed check-out handling | Auto-close or flag open sessions. | 1 | Should | Sys | — | — |
| ATT-11 | Employee attendance timeline | History per employee. | 1 | Must | E, M | `attendance:view` | — |
| ATT-12 | "Who's in now" board | Real-time presence per branch. | 1 | Must | M, O | `attendance:view` | Real-time visibility goal. |
| ATT-13 | Offline check-in + sync | Capture locally, sync when back online. | 1 | Must | E | — | Sites have weak connectivity. |
| ATT-14 | Mock-location detection | Basic GPS-spoofing guard. | 1 | Should | Sys | — | Hardened further in Phase 2. |

## 6. Tasks

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| TSK-01 | One-time task | Create a single task. | 1 | Must | M, S, A | `task:create` | — |
| TSK-02 | Recurring task | Daily/weekly repeating tasks. | 1 | Must | M, S, A | `task:create` | e.g. morning checklist. |
| TSK-03 | Task assignment | Assign to a person/team. | 1 | Must | M, S | `task:assign` | — |
| TSK-04 | Priority | Set task priority level. | 1 | Must | M, S | `task:create` | — |
| TSK-05 | Deadline | Due date/time per task. | 1 | Must | M, S | `task:create` | — |
| TSK-06 | Checklist / subtasks | Break a task into steps. | 1 | Must | M, S, E | `task:create` | Doubles as proof (PRF-03). |
| TSK-07 | Task lifecycle | open → in progress → submitted → approved/rejected → reopened. | 1 | Must | E, M | `task:view` | Core state machine. |
| TSK-08 | Task reassignment | Move a task to another assignee. | 1 | Should | M, S | `task:reassign` | — |
| TSK-09 | Task categories/tags | Classify tasks. | 1 | Should | M, S | `task:create` | Feeds reports. |
| TSK-10 | Task comments | Discussion thread on a task. | 1 | Should | E, M | `task:view` | — |
| TSK-11 | Location-bound tasks | Require being at the branch to complete. | 1 | Should | Sys | — | Uses geofence. |
| TSK-12 | Overdue flag | Mark tasks past deadline. | 1 | Must | Sys | — | Feeds escalation. |

## 7. Proof of Work

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| PRF-01 | Photo proof | Attach photo evidence to a task. | 1 | Must | E | `proof:submit` | — |
| PRF-02 | Note/text proof | Attach a written note. | 1 | Must | E | `proof:submit` | — |
| PRF-03 | Checklist-as-proof | Completed checklist counts as proof. | 1 | Must | E | `proof:submit` | — |
| PRF-04 | GPS pin on proof | Location stamped on the proof. | 1 | Must | Sys | — | — |
| PRF-05 | Proof metadata | Timestamp + device metadata. | 1 | Must | Sys | — | — |
| PRF-06 | Proof gallery | View all proof for a task. | 1 | Must | M, O | `proof:view` | "See the work, not just hear about it." |
| PRF-07 | Multiple proof items | Several proof pieces per task. | 1 | Should | E | `proof:submit` | — |
| PRF-08 | Proof-required enforcement | Block submit until required proof exists. | 1 | Must | Sys | — | Makes "done" mean done. |
| PRF-09 | Live-camera-only capture | Prevent gallery uploads; force live photo. | 1 | Should | Sys | — | Anti-fraud. |

## 8. Approvals & Escalations

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| APR-01 | Task approve/reject | Manager decides on submitted work. | 1 | Must | M, S | `task:approve`, `task:reject` | From phone. |
| APR-02 | Reject + reopen | Reject with reason, reopen for redo. | 1 | Must | M, S | `task:reject` | — |
| APR-03 | Attendance correction approval | Approve/reject correction requests. | 1 | Must | M, S | `attendance:approve` | — |
| APR-04 | First-decision-wins lock | First valid manager decision locks the item. | 1 | Must | Sys | — | Solves multi-manager conflict. |
| APR-05 | Escalation on no-response | Climbs the primary line first. | 1 | Must | Sys | — | Same-day intervention goal. |
| APR-06 | Escalation fan-out | Notify other in-scope managers if primary stalls. | 1 | Should | Sys | — | — |
| APR-07 | Approval inbox | Per-manager queue of pending decisions. | 1 | Must | M, S | `task:approve` | — |
| APR-08 | Configurable escalation timers | Set how long before escalation triggers. | 1 | Should | O, A | `settings:update` | — |

## 9. Reports & Dashboards

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| RPT-01 | Owner dashboard | Company-wide picture across all branches. | 1 | Must | O | `report:view` | The owner's core value. |
| RPT-02 | Manager dashboard | Team/department view. | 1 | Must | M, S | `report:view` | Scoped. |
| RPT-03 | Employee dashboard | "My day" — tasks + attendance. | 1 | Must | E | — | — |
| RPT-04 | Attendance report | Lateness/absence breakdown. | 1 | Must | O, M | `report:view` | — |
| RPT-05 | Task completion report | Completion counts and status. | 1 | Must | O, M | `report:view` | — |
| RPT-06 | On-time completion % | KPI for tasks done before deadline. | 1 | Must | O, M | `report:view` | Success metric. |
| RPT-07 | Proof-coverage % | % of tasks with valid proof attached. | 1 | Must | O, M | `report:view` | Success metric. |
| RPT-08 | Branch comparison | Rank/compare branches on real data. | 1 | Must | O | `report:view` | Kills "gut feeling" decisions. |
| RPT-09 | Drill-down | Company → branch → employee navigation. | 1 | Should | O, M | `report:view` | — |
| RPT-10 | Export | PDF / Excel / CSV export. | 1 | Must | O, M, Au | `report:export` | — |
| RPT-11 | Real-time KPI widgets | Live tiles on dashboards. | 1 | Should | O, M | `report:view` | — |
| RPT-12 | Time-to-intervention metric | Time from problem to manager action. | 1 | Should | O | `report:view` | Success metric. |

## 10. Notifications & Alerts

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| NOT-01 | Push notifications | Mobile push infrastructure. | 1 | Must | All | — | — |
| NOT-02 | In-app notification center | Central feed of alerts. | 1 | Must | All | — | — |
| NOT-03 | Task alerts | Assigned / updated / overdue. | 1 | Must | E, M | — | — |
| NOT-04 | Approval-needed alerts | Notify managers of pending decisions. | 1 | Must | M, S | — | — |
| NOT-05 | Lateness/absence alerts | Notify managers in real time. | 1 | Must | M, S | — | Same-day intervention. |
| NOT-06 | Escalation alerts | Notify up the chain on no-response. | 1 | Must | M, S | — | — |
| NOT-07 | Email notifications | Email channel for key events. | 1 | Should | All | — | — |
| NOT-08 | Notification preferences | Per-user channel/event settings. | 1 | Should | All | — | — |

## 11. Billing & Subscriptions

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| BIL-01 | Subscription plans | Define tiers/plans. | 1 | Must | O, BM | `billing:manage` | — |
| BIL-02 | Trial management | Free-trial period handling. | 1 | Must | Sys | — | — |
| BIL-03 | Account status lifecycle | trial → active → grace → suspended. | 1 | Must | Sys | — | Gates access. |
| BIL-04 | MyFatoorah integration | Collect payments via MyFatoorah. | 1 | Must | BM | `billing:manage` | Collection only (not e-invoicing). |
| BIL-05 | Per-seat pricing | Charge by active users. | 1 | Must | BM | `billing:manage` | — |
| BIL-06 | Invoices & receipts | Generate basic invoices/receipts. | 1 | Must | O, BM | `billing:view` | ZATCA compliance later (BIL-10). |
| BIL-07 | Payment history | List of past payments. | 1 | Should | O, BM | `billing:view` | — |
| BIL-08 | Auto-renewal & retries | Recurring charge with retry logic. | 1 | Should | Sys | — | — |
| BIL-09 | Dunning / grace comms | Notify on failed payment + grace period. | 1 | Should | Sys, BM | `billing:manage` | — |

## 12. Audit & Logging

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| AUD-01 | Audit trail | Log every sensitive action. | 1 | Must | Au | `audit:view` | — |
| AUD-02 | Immutable records | Who / what / when, tamper-resistant. | 1 | Must | Sys | — | — |
| AUD-03 | Decision logging | Attendance/task approval decisions with decider name. | 1 | Must | Sys | — | Ties to APR-04. |
| AUD-04 | Permission-change logging | Record role/permission edits. | 1 | Must | Sys | — | — |
| AUD-05 | Audit log viewer | Filter/search the trail. | 1 | Should | Au | `audit:view` | — |

## 13. Localization & KSA Compliance

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| LOC-01 | Arabic-first UI | Default language Arabic. | 1 | Must | All | — | — |
| LOC-02 | RTL layout | Full right-to-left support. | 1 | Must | All | — | — |
| LOC-03 | English toggle | Switch to English. | 1 | Should | All | — | — |
| LOC-04 | Hijri + Gregorian | Show Hijri alongside Gregorian. | 1 | Must | All | — | — |
| LOC-05 | AST timezone | UTC+3 throughout. | 1 | Must | Sys | — | — |
| LOC-06 | SAR currency | Saudi Riyal for billing/display. | 1 | Must | Sys | — | — |
| LOC-07 | PDPL consent capture | Explicit, recorded consent for location data. | 1 | Must | Sys | — | Sensitive-data requirement. |
| LOC-08 | Data retention policy | Configurable retention + deletion. | 1 | Must | O, A | `settings:update` | — |
| LOC-09 | In-region data residency | Host data in-region where feasible. | 1 | Must | Sys | — | Infra decision. |
| LOC-10 | Configurable labor rules | Overtime/working-hour logic not hardcoded. | 1 | Should | O, A | `settings:update` | Ties to SHF-05. |

## 14. Platform & Apps

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| APP-01 | Employee mobile app | Dead-simple iOS/Android app. | 1 | Must | E | — | Minimize taps (adoption risk). |
| APP-02 | Manager mobile app | Approvals + team follow-up on phone. | 1 | Must | M, S | — | — |
| APP-03 | Web dashboard | Admin/owner control panel. | 1 | Must | O, A | — | — |
| APP-04 | Offline mode + sync | Graceful offline capture and sync. | 1 | Must | E | — | Weak-connectivity sites. |
| APP-05 | Push infrastructure | Device push pipeline. | 1 | Must | Sys | — | Powers NOT-01. |
| APP-06 | Camera/GPS integration | Native device sensors. | 1 | Must | E | — | Powers attendance + proof. |
| APP-07 | Multi-tenant architecture | Isolated data per company. | 1 | Must | Sys | — | Data ownership stays with client. |

## 15. Settings

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| SET-01 | Company settings | Core workspace configuration. | 1 | Must | O, A | `settings:update` | — |
| SET-02 | Attendance policy settings | Geofence radius, grace period, rules. | 1 | Must | O, A | `settings:update` | — |
| SET-03 | Task settings | Default priorities, proof requirements. | 1 | Should | O, A | `settings:update` | — |
| SET-04 | Localization settings | Language, calendar, week, timezone. | 1 | Must | O, A | `settings:update` | — |
| SET-05 | Notification settings | Company-level notification defaults. | 1 | Should | O, A | `settings:update` | — |

## 16. Platform / Operator Console — *Operator Plane*

> This module lives on the **Ara Tasks operator side**, not inside any customer's workspace. Roles here are platform roles: `SA` Super Admin, `POps` Platform Ops/Support, `PFin` Platform Billing/Finance, `PAud` Platform Auditor. **Golden rule:** operators manage the *account*, never read the *contents* (attendance, tasks, proof, PII) without audited break-glass.

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| PLT-01 | Operator console | Web console for Ara Tasks staff to run the platform. | 1 | Must | SA, POps, PFin, PAud | — | Separate app from the tenant dashboard. |
| PLT-02 | Operator identity + 2FA/SSO | Separate operator login with mandatory 2FA/SSO. | 1 | Must | SA | — | Distinct identity space from tenants. |
| PLT-03 | Tenant directory | List all tenants with status/plan/seats/region. | 1 | Must | SA, POps, PFin, PAud | `tenant:view` | Account metadata only, not contents. |
| PLT-04 | Tenant provisioning | Create/onboard a new tenant workspace. | 1 | Must | SA, POps | `tenant:provision` | — |
| PLT-05 | Tenant lifecycle | Suspend/reactivate a tenant account. | 1 | Must | SA, POps | `tenant:lifecycle` | Ties to BIL-03 account status. |
| PLT-06 | Tenant offboarding | Terminate a tenant + trigger data-deletion workflow. | 1 | Must | SA | `tenant:offboard` | PDPL deletion; Super-Admin only. |
| PLT-07 | Region / data-residency assignment | Pin a tenant to an in-region data location. | 1 | Should | SA, POps | `tenant:provision` | Ties to LOC-09. |
| PLT-08 | Break-glass impersonation | Consented, time-boxed, read-only-by-default tenant access. | 1 | Should | SA, POps | `tenant:impersonate` | Single most sensitive permission. |
| PLT-09 | Impersonation dual-audit + banner | Log every session on both sides + visible in-tenant banner. | 1 | Must* | Sys | `platform_audit:view`, `audit:view` | *Must if PLT-08 ships. |
| PLT-10 | Subscription plan management | Create/edit plans, pricing, bundled features. | 1 | Must | SA, PFin | `plan:manage` | Feeds tenant BIL-01. |
| PLT-11 | Plan → feature entitlements | Map which features each plan unlocks. | 1 | Should | SA, PFin | `plan:manage` | Drives feature gating. |
| PLT-12 | Feature flag management | Toggle platform/per-tenant flags (face, AI…). | 1 | Should | SA, POps | `feature_flag:manage` | Governs SET-07, ATT-15, AI-07. |
| PLT-13 | Platform billing dashboard | Cross-tenant revenue, invoices, MRR. | 1 | Must | SA, PFin, PAud | `platform_billing:view` | — |
| PLT-14 | Platform billing operations | Refunds, credits, plan overrides, dunning. | 1 | Should | SA, PFin | `platform_billing:manage` | — |
| PLT-15 | Internal staff management | Manage Ara Tasks employee accounts. | 1 | Must | SA | `platform_user:manage` | — |
| PLT-16 | Platform role management | Create/edit platform roles and permissions. | 1 | Should | SA | `platform_role:manage` | — |
| PLT-17 | Platform audit trail | Log all operator actions + access/impersonation. | 1 | Must | SA, PAud | `platform_audit:view` | Cross-tenant accountability. |
| PLT-18 | Platform settings | Platform-wide configuration. | 1 | Should | SA | `platform_settings:manage` | — |

---
---

# PART 2 — Full Product (Phase 2 & 3)

> Fast-follow intelligence and heavier compliance (Phase 2), then multi-market expansion (Phase 3). These sit **on top of** the clean operational data the MVP generates.

## 1. Organization & Structure

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| ORG-12 | Org chart visualization | Visual hierarchy + matrix map. | 2 | Should | O, A | `user:view` | — |
| ORG-13 | Bulk org import | Import branches/departments/teams at once. | 2 | Could | O, A | `branch:manage` | Onboarding speed. |
| ORG-14 | Regions / cost centers | Group branches into regions for rollups. | 3 | Could | O, A | `branch:manage` | Multi-market expansion. |

## 2. Users & Identity

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| USR-13 | Two-factor authentication | 2FA for sensitive accounts. | 2 | Should | O, A, M | — | — |
| USR-14 | Bulk user import | CSV import of employees. | 2 | Should | O, A | `user:create` | — |
| USR-15 | Employee document store | Contracts, IDs, certificates. | 2 | Could | O, A | `user:update` | PDPL retention applies. |
| USR-16 | Shared-device exception mode | Explicit path for one-phone-per-team cases. | 2 | Should | O, A | `settings:update` | From constraints. |
| USR-17 | SSO / SAML | Enterprise single sign-on. | 3 | Could | A | — | Larger clients. |

## 3. Roles & Permissions

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| RBAC-11 | Clone / template roles | Duplicate a role as a starting point. | 2 | Could | O, A | `role:create` | — |
| RBAC-12 | Delegated / time-bound permissions | Temporary acting-manager rights. | 2 | Should | O, A | `role:assign` | Covers leave/absence. |

## 4. Shifts & Scheduling

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| SHF-10 | Shift swap requests | Employees trade shifts with approval. | 2 | Should | E, M | `shift:manage` | — |
| SHF-11 | Leave / time-off requests | Request + approve leave. | 2 | Should | E, M | `shift:manage` | Feeds absence logic. |
| SHF-12 | Predictive staffing | Suggest staffing from historical demand. | 3 | Could | O, M | `ai:use` | Depends on AI + data. |
| SHF-13 | Open shifts / self-scheduling | Publish open slots employees claim. | 3 | Could | M, E | `shift:manage` | — |

## 5. Attendance

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| ATT-15 | Face verification | Optional biometric check at check-in. | 2 | Should | E | — | **Per-company toggle; needs consent + retention first.** |
| ATT-16 | Face-verification consent | Explicit recorded consent before enabling. | 2 | Must* | E | — | *Must if ATT-15 enabled (PDPL). |
| ATT-17 | Attendance anomaly detection | AI flags suspicious patterns. | 2 | Should | Sys | `ai:use` | — |
| ATT-18 | Roaming / field attendance | Multi-site check-ins for moving crews. | 2 | Should | E, M | `attendance:view` | Cleaning/field teams. |
| ATT-19 | Kiosk / shared attendance mode | Fixed-device check-in point. | 2 | Could | E | — | Ties to USR-16. |
| ATT-20 | Advanced spoofing defense | Hardened anti-GPS-spoofing + device signals. | 2 | Should | Sys | — | Extends ATT-14. |

## 6. Tasks

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| TSK-13 | Task templates library | Reusable task/checklist templates. | 2 | Should | M, A | `task:create` | Speeds recurring ops. |
| TSK-14 | Bulk task assignment | Assign to many people/branches at once. | 2 | Should | M, A | `task:assign` | — |
| TSK-15 | Natural-language task creation | Create tasks from plain Arabic/English text. | 2 | Should | M | `ai:use` | AI layer. |
| TSK-16 | Smart task distribution | AI load-balances assignments. | 2 | Should | Sys | `ai:use` | — |
| TSK-17 | Recurring instance management | Skip/reschedule single occurrences. | 2 | Should | M | `task:create` | — |
| TSK-18 | Task calendar view | Calendar of tasks/deadlines. | 2 | Could | M, E | `task:view` | — |
| TSK-19 | Task dependencies | Task B unlocks after Task A. | 3 | Could | M | `task:create` | — |

## 7. Proof of Work

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| PRF-10 | Video proof | Attach short video evidence. | 2 | Could | E | `proof:submit` | Storage cost consideration. |
| PRF-11 | Signature capture | On-screen signature as proof. | 2 | Could | E | `proof:submit` | Sign-off workflows. |
| PRF-12 | Proof retention controls | Auto-expire proof per policy. | 2 | Should | O, A | `settings:update` | PDPL. |

## 8. Approvals & Escalations

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| APR-09 | Bulk approve | Approve multiple items at once. | 2 | Should | M | `task:approve` | — |
| APR-10 | Approval delegation | Hand approval authority to another manager. | 2 | Should | M, A | `role:assign` | Ties to RBAC-12. |

## 9. Reports & Dashboards

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| RPT-13 | Scheduled/emailed reports | Auto-send reports on a cadence. | 2 | Should | O, M | `report:export` | — |
| RPT-14 | Adoption/usage analytics | Track DAU, feature usage vs. WhatsApp fallback. | 2 | Should | O | `report:view` | Success metric. |
| RPT-15 | Custom report builder | Build ad-hoc reports. | 2 | Could | O, A | `report:view` | — |
| RPT-16 | AI insights on reports | Narrative explanations of the numbers. | 2 | Should | O, M | `ai:use` | — |
| RPT-17 | Predictive analytics | Forecast attendance/completion trends. | 3 | Could | O | `ai:use` | — |

## 10. Notifications & Alerts

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| NOT-09 | SMS notifications | SMS channel for critical alerts. | 2 | Should | All | — | — |
| NOT-10 | WhatsApp notifications | Reach users on WhatsApp. | 2 | Could | All | — | Displace their manual fallback. |
| NOT-11 | AI daily digest | Auto summary of the day's operations. | 2 | Should | O, M | `ai:use` | Ties to AI-02. |
| NOT-12 | Quiet hours / prayer-aware suppression | Hold non-urgent alerts during prayer/quiet times. | 2 | Could | O, A | `settings:update` | — |

## 11. Billing & Subscriptions

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| BIL-10 | ZATCA e-invoicing (Fatoora) | Compliant e-invoices for KSA businesses. | 2 | Must | Sys, BM | `billing:manage` | Separate from MyFatoorah collection. |
| BIL-11 | Upgrade/downgrade + proration | Plan changes with prorated billing. | 2 | Should | BM | `billing:manage` | — |
| BIL-12 | Coupons / discounts | Promo codes and discounts. | 2 | Could | BM | `billing:manage` | — |
| BIL-13 | Multi-currency | Bill in currencies beyond SAR. | 3 | Should | BM | `billing:manage` | Expansion requirement. |
| BIL-14 | Usage-based add-ons | Charge for AI/extra usage. | 3 | Could | BM | `billing:manage` | — |

## 12. AI Layer

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| AI-01 | AI assistant | Natural-language Q&A about the day ("who's late today?"). | 2 | Should | O, M | `ai:use` | "Reads the day for me." |
| AI-02 | Auto daily summary | Generated end-of-day operations brief. | 2 | Should | O, M | `ai:use` | — |
| AI-03 | Natural-language task creation | Plain text → structured task. | 2 | Should | M | `ai:use` | Mirrors TSK-15. |
| AI-04 | Smart task distribution | Balanced auto-assignment. | 2 | Should | Sys | `ai:use` | Mirrors TSK-16. |
| AI-05 | Attendance anomaly detection | Spot manipulation/patterns. | 2 | Should | Sys | `ai:use` | Mirrors ATT-17. |
| AI-06 | Early-warning signals | Flag slipping branches / chronic lateness before crisis. | 2 | Should | O, M | `ai:use` | Core "warn me early" promise. |
| AI-07 | AI configuration & toggle | Enable/tune AI per company. | 2 | Must | O, A | `ai:configure` | Governs all AI features. |
| AI-08 | Arabic NLP | Understand Arabic input reliably. | 2 | Must | Sys | — | Required for AI in KSA. |
| AI-09 | Predictive staffing | Forecast staffing needs. | 3 | Could | O, M | `ai:use` | Mirrors SHF-12. |

## 13. Audit & Logging

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| AUD-06 | Audit export | Export audit logs for review/compliance. | 2 | Should | Au | `audit:view` | — |
| AUD-07 | Data-access logs | Record who accessed sensitive data (PDPL). | 2 | Should | Au | `audit:view` | — |
| AUD-08 | Tamper-evidence | Cryptographic integrity on logs. | 3 | Could | Sys | — | — |

## 14. Localization & Compliance

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| LOC-11 | Biometric template storage | Store verification templates, not raw face images. | 2 | Must* | Sys | — | *If ATT-15 enabled. |
| LOC-12 | Data-subject requests | Right-to-access / right-to-delete workflows. | 2 | Should | O, A | `settings:update` | PDPL. |
| LOC-13 | Multi-language framework | Extensible i18n beyond Arabic/English. | 3 | Could | Sys | — | Expansion. |
| LOC-14 | Broader Gulf/MENA localization | Local calendars, weekends, rules per market. | 3 | Could | O, A | `settings:update` | Expansion. |

## 15. Platform & Apps

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| APP-08 | Public API / webhooks | Programmatic access + event hooks. | 2 | Should | A | — | Enables integrations. |
| APP-09 | QR / deep-link onboarding | Fast join via QR or link. | 2 | Could | E | — | — |
| APP-10 | Accessibility | WCAG-aligned accessible UI. | 2 | Should | All | — | — |
| APP-11 | Payroll / HR integrations | Connect to payroll & export formats. | 2 | Should | A, PV | `report:export` | Payroll Viewer role. |
| APP-12 | White-label / branding | Company logo/theme in-app. | 3 | Could | O, A | `settings:update` | — |

## 16. Settings

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| SET-06 | Security settings | 2FA policy, device policy. | 2 | Should | O, A | `settings:update` | — |
| SET-07 | Feature toggles | Turn face verification / AI on per company. | 2 | Should | O, A | `settings:update` | Governs ATT-15, AI-07. |
| SET-08 | Data & privacy settings | Retention windows, consent, deletion. | 2 | Should | O, A | `settings:update` | PDPL. |
| SET-09 | Integration settings | Configure external connectors. | 2 | Could | A | `settings:update` | — |

## 17. Platform / Operator Console — *Operator Plane*

| ID | Feature | Description | Phase | Priority | Roles | Permissions | Notes |
|---|---|---|---|---|---|---|---|
| PLT-19 | Platform audit export | Export platform audit logs for compliance. | 2 | Should | SA, PAud | `platform_audit:export` | — |
| PLT-20 | Cross-tenant usage & health analytics | Adoption/health scoring across tenants. | 2 | Should | SA, POps | `tenant:view` | Churn/expansion signals. |
| PLT-21 | Guided onboarding workflow | Step-by-step tenant onboarding checklist. | 2 | Could | POps | `tenant:provision` | Speeds activation. |
| PLT-22 | Hardened impersonation controls | Granular least-privilege + scoped impersonation. | 2 | Should | SA | `tenant:impersonate` | Extends PLT-08. |
| PLT-23 | Reseller / partner management | Multi-level operator (partners resell Ara Tasks). | 3 | Could | SA | `platform_role:manage` | Expansion GTM. |
| PLT-24 | White-label operator portals | Branded operator portals per reseller. | 3 | Could | SA | `platform_settings:manage` | Expansion. |

---
---

# Traceability Check

Every requirement in the Project Description maps to at least one feature.

| Source (Project Description) | Covered by |
|---|---|
| Attendance tied to location/shift/device | ATT-01–04, USR-09, ORG-03 |
| Tasks tied to person + deadline + priority | TSK-01–05 |
| Proof tied to every task | PRF-01–08, TSK-06 |
| Manager approve/reject from phone | APR-01–03, APP-02 |
| AI that "reads the day" | AI-01–06, NOT-11 |
| Real-time visibility across company | RPT-01, ATT-12, RPT-11 |
| Trusted attendance (location/face/device) | ATT-02–04, ATT-15, USR-09 |
| Same-day intervention | APR-05–06, NOT-05, RPT-12 |
| Self-building reports | RPT-04–10 |
| Warn before crisis | AI-06, ATT-17, RPT-14 |
| Scope: everyone sees only their slice | RBAC-06, ORG-11 |
| KSA-first localization | LOC-01–09, SHF-06–09 |
| `resource:action` permissions, custom roles | RBAC-01–10 |
| Company / Branch / Department / Team model | ORG-01–07 |
| Department spans branches (independent axis) | ORG-06 |
| Multi-level + matrix reporting | ORG-08–10 |
| First-decision-wins + one Primary Manager | APR-04, ORG-10 |
| Device binding | USR-09–10 |
| Shifts & schedules | SHF-01–09 |
| Attendance corrections + approval | ATT-08–09, APR-03 |
| Subscriptions / MyFatoorah / account status | BIL-01–09 |
| Mobile apps + web dashboard | APP-01–03 |
| Arabic-first, RTL | LOC-01–02 |
| Face verification (Phase 2, toggle) | ATT-15–16, LOC-11, SET-07 |
| Predictive staffing / advanced analytics | SHF-12, RPT-17, AI-09 |
| Payroll integrations / export formats | APP-11, RPT-10 |
| ZATCA e-invoicing | BIL-10, LOC-15→BIL-10 |
| Gulf/MENA expansion, multi-currency | ORG-14, BIL-13, LOC-13–14 |
| PDPL: consent, retention, residency, templates | LOC-07–12 |
| Hijri / prayer-time / Ramadan / AST / SAR | LOC-04–06, SHF-08–09 |
| Configurable labor rules | LOC-10, SHF-05 |
| Audit of sensitive actions | AUD-01–07 |
| Offline degrade + sync | ATT-13, APP-04 |
| Shared-device exception | USR-16, ATT-19 |
| Success metrics (on-time %, proof %, adoption) | RPT-06–07, RPT-14 |
| Multi-tenant SaaS: data isolation per company | APP-07, PLT-01–18 |
| Operator plane: provision / suspend / bill tenants | PLT-03–06, PLT-10–14 |
| Break-glass tenant access (consent + dual audit) | PLT-08–09, AUD-07 |
| Ara Tasks acts as processor (PDPL) | PLT-06, PLT-09, PLT-17, LOC-07–12 |

**Result:** No orphan requirements. All 12 open decisions in Section 12 are reflected (biometric → ATT-15/LOC-11; multi-manager → APR-04; department axis → ORG-06; over-engineering → RBAC-02 defaults; spoofing → ATT-14/20; offline → ATT-13; adoption → APP-01).

---

# Summary Counts

| Module | Phase 1 (MVP) | Phase 2 | Phase 3 | Total |
|---|---|---|---|---|
| Organization | 11 | 2 | 1 | 14 |
| Users & Identity | 12 | 4 | 1 | 17 |
| Roles & Permissions | 10 | 2 | 0 | 12 |
| Shifts | 9 | 2 | 2 | 13 |
| Attendance | 14 | 5 | 1 | 20 |
| Tasks | 12 | 5 | 2 | 19 |
| Proof of Work | 9 | 3 | 0 | 12 |
| Approvals | 8 | 2 | 0 | 10 |
| Reports | 12 | 3 | 2 | 17 |
| Notifications | 8 | 3 | 1 | 12 |
| Billing | 9 | 3 | 2 | 14 |
| AI Layer | 0 | 8 | 1 | 9 |
| Audit | 5 | 2 | 1 | 8 |
| Localization | 10 | 2 | 2 | 14 |
| Platform & Apps | 7 | 4 | 1 | 12 |
| Settings | 5 | 4 | 0 | 9 |
| Platform / Operator Console | 18 | 4 | 2 | 24 |
| **Total** | **159** | **58** | **19** | **236** |

---

*Next document in the chain: turn this catalog into a prioritized backlog (epics → stories), then an SRS with acceptance criteria per feature.*
