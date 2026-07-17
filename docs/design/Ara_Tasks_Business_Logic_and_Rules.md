# Ara Tasks — Business Logic & Rules

**Purpose:** Define the internal rules that make Ara Tasks behave deterministically — the conditions and decisions that sit *underneath* the user flows. This document answers the "when / who / what happens" questions: when a task is completed, when a notification fires, who can approve, who can reject, how states change, and how conflicts resolve.

**Relationship to other docs:** *User Flows* shows the journey; this document specifies the rules each step obeys. Every rule references the feature IDs from *Features Identification* and respects the scopes in *User Roles & Permissions*.

**How to read a rule:** each rule has an ID (`BR-<DOMAIN>-NN`), is written as a testable statement (condition → outcome), and is either an **invariant** (never configurable) or **configurable** (tunable per company). Rule IDs let each become an acceptance criterion later.

**Domains:** `T` Task · `A` Attendance · `P` Proof · `D` Decisions (approve/reject) · `N` Notifications · `E` Escalation · `R` RBAC/Scope · `B` Billing/Account · `V` Device/Integrity · `C` Compliance/Data · `O` Operator plane · `X` Cross-cutting.

---

## Quick Answers (the four headline questions)

- **When is a task "completed"?** Only when it is **Submitted with all required proof** *and* **a permitted manager approves it**. Approval locks the task and writes it to the audit trail. Submission alone, or a finished checklist alone, is **not** completed. → `BR-T-01`
- **When is a notification sent?** On defined **events** (task assigned/overdue, work submitted, approved/rejected, late/absent, correction requested/decided, escalation, payment issue, device re-bind, impersonation). Each event has fixed recipients, channel, and priority. → `BR-N-*`
- **Who approves?** Any user who **holds `task:approve` (or `attendance:approve`)**, **within whose scope the item falls**, and who is **not the submitter**. The **first valid decision wins and locks** the item. → `BR-D-01/03/05`
- **Who rejects?** Same eligibility as approve, using **`task:reject`**, and a **rejection reason is mandatory**; rejection reopens the item for rework. → `BR-D-02/06`

---
---

## 1. Core States (canonical status vocabulary)

Every entity has exactly one **state**; flags are orthogonal booleans.

### Task states
| State | Meaning | Terminal? |
|---|---|---|
| `Open` | Created/assigned, not started. | No |
| `InProgress` | Assignee started work. | No |
| `Submitted` | Proof attached + submitted; awaiting decision. | No |
| `Approved` | A permitted manager approved → **Completed**. Locked. | **Yes** |
| `Reopened` | Rejected with reason; back to the assignee. | No |
| `Cancelled` | Voided by a manager before completion. | **Yes** |

**Task flags (orthogonal):** `Overdue` (past deadline, not yet Approved), `LocationBound` (must be on-site to complete), `Recurring` (instance of a series).

### Attendance states & flags
| State (session) | Meaning |
|---|---|
| `Open` | Checked in, not yet out. |
| `Closed` | Checked out normally. |
| `AutoClosed` | Missed check-out, system-closed/flagged. |
| `PendingSync` | Captured offline, not yet validated server-side. |

**Attendance flags:** `OnTime`, `Late`, `Absent`, `EarlyDeparture`, `UnderReview` (correction requested), `Corrected`.

### Correction, Account, User states
| Entity | States |
|---|---|
| **Correction request** | `Pending` → `Approved` / `Rejected` (terminal, locked). |
| **Account (tenant)** | `Trial` → `Active` → `Grace` → `Suspended`; `Terminated` (offboarded). |
| **User** | `Invited` → `Active` → `Suspended` / `Deactivated`. |

---
---

## 2. Task Lifecycle Rules (`BR-T`)

**`BR-T-01` (invariant) — Definition of completed.** A task is `Approved` **only if** it was `Submitted` with all required proof present *and* a user holding `task:approve` in scope approves it. `Approved` = Completed = Done. `PRF-08`, `APR-01`, `TSK-07`

**`BR-T-02` (invariant) — Submission gate.** A task can move `InProgress → Submitted` **only if**: (a) it has an assignee, (b) all **required** proof items exist (`BR-P-02`), and (c) if `LocationBound`, the assignee is inside the branch geofence at submit time. Otherwise submit is blocked. `PRF-08`, `TSK-11`

**`BR-T-03` (invariant) — Legal transitions.** Only these transitions are allowed:

| From | To | Guard / trigger |
|---|---|---|
| `Open` | `InProgress` | assignee starts |
| `InProgress` | `Submitted` | passes `BR-T-02` |
| `Submitted` | `Approved` | permitted manager approves (`BR-D-01`) |
| `Submitted` | `Reopened` | permitted manager rejects with reason (`BR-D-02`) |
| `Reopened` | `InProgress` | assignee reworks |
| `Open`/`InProgress`/`Submitted`/`Reopened` | `Cancelled` | manager with `task:create`/`task:reassign` voids it |

Any transition not listed is rejected. `TSK-07`

**`BR-T-04` (invariant) — Approved is locked.** Once `Approved`, a task is immutable except by an explicit, audited reopen by a permitted manager (which creates a new decision record). `APR-04`, `AUD-03`

**`BR-T-05` (config) — Overdue flag.** A task is flagged `Overdue` when `now > deadline` and state ∉ {`Approved`,`Cancelled`}. Overdue is a flag, not a state; it triggers `BR-N-03` and feeds escalation `BR-E-*`. `TSK-12`

**`BR-T-06` (invariant) — Assignment required.** A task with no assignee cannot leave `Open` toward submission. `TSK-03`

**`BR-T-07` (invariant) — Reassignment.** Reassigning changes the assignee and returns the task to `Open`/`InProgress` (never past `Submitted` silently); prior proof is retained but the new assignee must satisfy `BR-T-02` before resubmitting. Requires `task:reassign` in scope. `TSK-08`

**`BR-T-08` (config) — Recurring generation.** Each recurring series generates one task **instance** per schedule occurrence. Skipping/rescheduling one instance does **not** alter the series. Instances are independent for completion and reporting. `TSK-02`, `TSK-17`

**`BR-T-09` (invariant) — No self-approval.** The assignee/submitter of a task can never approve their own task, even if they hold `task:approve`. `BR-D-05`

---
---

## 3. Attendance Rules (`BR-A`)

**`BR-A-01` (invariant) — Check-in validation gate (ordered).** A check-in is accepted **only if all** pass, evaluated in order; the first failure blocks (offline path excepted, `BR-A-08`):
1. User `Active` and has an assigned shift for now. `USR-11`, `SHF-02`
2. Location consent on record. `LOC-07`, `BR-C-01`
3. Request from the **bound device**. `USR-09`, `ATT-04`
4. GPS captured; **not** mock-location. `ATT-02`, `ATT-14`
5. Inside the branch **geofence**. `ATT-03`

**`BR-A-02` (config) — On-time vs late.** After a valid check-in: if `checkin_time ≤ shift_start + grace` → `OnTime`; else `Late`. Grace is per-company/shift configurable. A `Late` flag fires `BR-N-05`. `ATT-05`, `SHF-04`

**`BR-A-03` (config) — Absence.** If no valid check-in exists by `shift_start + absence_threshold`, the record is flagged `Absent` and fires `BR-N-06`. Approved leave (Phase 2) suppresses this. `ATT-06`, `SHF-11`

**`BR-A-04` (invariant) — Early departure.** A check-out before `shift_end` flags `EarlyDeparture`. `ATT-07`

**`BR-A-05` (config) — Missed check-out.** An `Open` session with no check-out by `shift_end + cutoff` is `AutoClosed` and flagged for manager review (never silently logged as a full-length shift). `ATT-10`

**`BR-A-06` (invariant) — Correction requires approval.** Employees cannot edit attendance directly; they submit a `Pending` correction (`attendance:correct`, self scope). Only a permitted manager decides it (`BR-D-03`). `ATT-08/09`

**`BR-A-07` (invariant) — One open session per user.** A user cannot check in twice without checking out; a second check-in attempt is rejected while a session is `Open`.

**`BR-A-08` (invariant) — Offline capture.** When offline, check-in/proof is captured locally with GPS + timestamp and queued as `PendingSync`. On reconnect it syncs and **`BR-A-01` is validated retroactively**; conflicts are flagged for a manager, never auto-accepted. `ATT-13`, `APP-04`, `BR-X-01`

---
---

## 4. Proof Rules (`BR-P`)

**`BR-P-01` (invariant) — Valid proof types.** Proof is a photo, a text note, or a completed checklist. Each proof item is auto-stamped with GPS + timestamp + device metadata. `PRF-01/02/03/04/05`

**`BR-P-02` (config) — Required proof.** A task defines what proof is required (e.g. ≥1 photo). Submission is blocked until the requirement is met (`BR-T-02`). Default requirement is set in Task Settings. `PRF-08`, `SET-03`

**`BR-P-03` (config) — Live-camera enforcement.** When enabled, photo proof must come from the live camera; gallery uploads are rejected. `PRF-09`

**`BR-P-04` (invariant) — Proof is append-only pre-approval.** Proof can be added while `InProgress`/`Reopened`; once `Approved`, the proof set is locked with the task. `BR-T-04`

---
---

## 5. Decision Authority — Who Approves, Who Rejects (`BR-D`)

**`BR-D-01` (invariant) — Approve eligibility.** A user may **approve** an item **iff**: holds the relevant permission (`task:approve` for tasks, `attendance:approve` for corrections) **AND** the item's subject is within the user's assigned scope **AND** the item is not already locked **AND** the user is not the submitter. `RBAC-06`, `APR-01`

**`BR-D-02` (invariant) — Reject eligibility + mandatory reason.** Same eligibility as `BR-D-01` using `task:reject`. A **reason is mandatory**; rejection sets the task to `Reopened` and notifies the assignee. `APR-02`

**`BR-D-03` (invariant) — Correction decisions.** Attendance corrections are approved/rejected under the same eligibility using `attendance:approve`. `APR-03`

**`BR-D-04` (invariant) — First decision wins.** When multiple managers are in scope (matrix reporting), the **first valid decision locks** the item; later attempts return "already decided." Enforced at the data layer, not the UI. `APR-04`, `BR-X-02`

**`BR-D-05` (invariant) — No self-decision.** No user approves or rejects an item they submitted, regardless of permissions held. `BR-T-09`

**`BR-D-06` (invariant) — Primary Manager ≠ sole approver.** The Primary Manager is the **accountability + escalation** line, not an exclusive gate: any in-scope permitted manager can still act first. Payroll/performance reporting and escalation routing use the Primary line. `ORG-10`, `APR-05`

**Who holds these by default** (from the roles matrix): `task:approve`/`task:reject` and `attendance:approve` → **Owner, Admin, Manager, Supervisor** (each within their scope). Employees, Auditors, Payroll Viewers, Billing Managers hold none of them.

| Item to decide | Permission needed | Scope check | Extra guards |
|---|---|---|---|
| Submitted task | `task:approve` / `task:reject` | subject in actor's scope | not submitter · not locked · reason required to reject |
| Attendance correction | `attendance:approve` | employee in actor's scope | not requester · first decision locks |
| Device re-bind | `user:update` | user in actor's scope | Admin/Manager only |

---
---

## 6. Notification Rules (`BR-N`)

**`BR-N-00` (invariant) — Event-driven only.** Notifications fire from defined events, never on a schedule guess. Each has fixed recipients, channel, and priority. Recipients are resolved by scope (`BR-R-*`). `NOT-*`

| Rule | Event — fires when | Recipient(s) | Channel | Priority |
|---|---|---|---|---|
| `BR-N-01` | Task assigned/reassigned | assignee | push + in-app | Normal |
| `BR-N-02` | Task edited (deadline/priority/checklist) | assignee | in-app | Low |
| `BR-N-03` | Task becomes `Overdue` | assignee + in-scope manager | push + in-app | High |
| `BR-N-04` | Task → `Submitted` (approval needed) | in-scope manager(s) | push + in-app | High |
| `BR-N-05` | Late check-in recorded | in-scope manager | push + in-app | High |
| `BR-N-06` | Absence detected | in-scope manager | push + in-app | High |
| `BR-N-07` | Task `Approved` | assignee | in-app | Normal |
| `BR-N-08` | Task `Reopened` (rejected) | assignee | push + in-app | High |
| `BR-N-09` | Correction requested | in-scope manager | push + in-app | Normal |
| `BR-N-10` | Correction decided | requesting employee | in-app | Normal |
| `BR-N-11` | Escalation triggered | next line / other in-scope managers | push + in-app (+ email) | Urgent |
| `BR-N-12` | Payment failed / grace / suspension | Billing Manager + Owner | email + in-app | High |
| `BR-N-13` | Device re-bind requested | Admin/Manager in scope | push + in-app | Normal |
| `BR-N-14` | Operator break-glass session active | tenant Owner/Admin (persistent banner) | in-app banner | High |

**`BR-N-15` (config) — Quiet hours / prayer-aware suppression.** During configured quiet/prayer windows, only `Low` and `Normal` notifications are held and batched; `High` and `Urgent` always deliver immediately. `NOT-12`

**`BR-N-16` (config) — Per-user preferences.** A user may mute channels per event class, but cannot mute `Urgent` (escalation) or account/billing alerts. `NOT-08`

---
---

## 7. Escalation Rules (`BR-E`)

**`BR-E-01` (invariant) — Trigger.** A `Submitted` task (or an `Overdue` task) with no valid decision within its **escalation timer** enters escalation. `APR-05`, `APR-08`

**`BR-E-02` (config) — Timer.** The escalation timer (T1) is per-company configurable; default sensible value set in settings. `APR-08`

**`BR-E-03` (invariant) — Order: primary line first, then fan-out.** On timeout: (1) escalate up the **Primary Manager** line; (2) if still no decision after the next interval, **fan out** to all other in-scope managers; (3) alerts climb the chain. `APR-05/06`, `ORG-10`, `NOT-11`

**`BR-E-04` (invariant) — First response ends it.** The **first valid decision** anywhere in scope locks the item and stops escalation (`BR-D-04`). No single absent manager can freeze the operation.

---
---

## 8. Permission & Scope Rules (`BR-R`)

**`BR-R-01` (invariant) — Deny by default.** Any action with no matching granted permission in scope is denied. `RBAC-07`

**`BR-R-02` (invariant) — Union of roles.** A user's effective permissions are the union of all assigned roles; scopes apply per grant. `RBAC-09`

**`BR-R-03` (invariant) — Scope cascade.** A permission granted at a scope covers everything beneath it (company ⊃ branch ⊃ department ⊃ team ⊃ self) and **nothing outside** it. `RBAC-06`

**`BR-R-04` (invariant) — Server-side enforcement.** Every request is checked server-side; permission-aware UI is a convenience, never the security boundary. `RBAC-07/08`

**`BR-R-05` (invariant) — Plane isolation.** A tenant role can never carry a platform permission and vice-versa; the two identity spaces never merge. `BR-O-01`

---
---

## 9. Account & Billing Lifecycle Rules (`BR-B`)

**`BR-B-01` (invariant) — State machine.** An account is always in exactly one state, transitioning as below. `BIL-03`

| State | Enters when | Access granted | Exits when |
|---|---|---|---|
| `Trial` | Signup | Full product | Trial ends → `Active` (if paid) or `Grace` |
| `Active` | Successful payment | Full product | Payment fails → `Grace` |
| `Grace` | Payment failed or trial lapsed | **Full access + warnings** for the grace window | Paid → `Active`; window ends → `Suspended` |
| `Suspended` | Grace window expires | Operational login **blocked**; only Owner/Billing Manager can log in to pay | Paid → `Active` |
| `Terminated` | Offboarding | No access; deletion workflow runs | — |

**`BR-B-02` (config) — Dunning.** On a failed charge, retries run on a schedule and `BR-N-12` notifies Owner/Billing Manager throughout the grace window. `BIL-08/09`

**`BR-B-03` (invariant) — Suspension is non-destructive.** `Suspended` withholds access but does **not** delete data; only `Terminated` + the deletion workflow removes data. `BR-O-04`

**`BR-B-04` (config) — Per-seat counting.** Billable seats = count of `Active` users; `Invited`/`Deactivated` users are not billed. `BIL-05`

---
---

## 10. Device & Integrity Rules (`BR-V`)

**`BR-V-01` (invariant) — One bound device.** Each user has one active bound device (unless the shared-device exception is enabled). Check-in requires the bound device (`BR-A-01`). `USR-09`

**`BR-V-02` (invariant) — Re-bind needs approval.** Changing the bound device requires a request + approval by an Admin/Manager (`user:update`); until approved, check-in stays blocked on the new device. `USR-10`

**`BR-V-03` (config) — Shared-device exception.** When enabled for a tenant, kiosk/shared-device mode replaces 1:1 binding for the affected users. `USR-16`, `ATT-19`

**`BR-V-04` (invariant) — Integrity signals stack.** Geofence + device binding + mock-location detection are combined; failing any hard signal blocks the check-in. `ATT-03/04/14`

---
---

## 11. Compliance & Data Rules (`BR-C`)

**`BR-C-01` (invariant) — Consent before location.** No GPS/location is captured or stored until PDPL consent is recorded for that user. No consent → no check-in. `LOC-07`

**`BR-C-02` (config) — Retention.** Sensitive records (location, proof, attendance) are purged or anonymized after the configured retention window; deletion is logged. `LOC-08`, `PRF-12`

**`BR-C-03` (invariant) — Data residency.** A tenant's data is stored in its assigned region; processing honors that region. `LOC-09`, `PLT-07`

**`BR-C-04` (invariant, Phase 2) — Biometrics.** Face verification requires explicit recorded consent, stores **templates not raw images**, and always offers an opt-out. Off unless the tenant toggle is on. `ATT-15/16`, `LOC-11`, `SET-07`

**`BR-C-05` (invariant) — Sensitive actions are logged.** Every approval, correction, permission change, and data access on sensitive data writes an immutable audit entry with the actor's name. `AUD-01/02/03/04/07`

---
---

## 12. Operator Plane Rules (`BR-O`)

**`BR-O-01` (invariant) — No implicit tenant-content access.** Platform roles manage the *account* only; they never read attendance, tasks, proof, or PII by default. `PLT-03`

**`BR-O-02` (invariant) — Break-glass conditions.** Tenant access requires an active `tenant:impersonate` session that is **consented (or contractually authorized), time-boxed, and read-only by default**; write requires an explicit tenant grant. `PLT-08`

**`BR-O-03` (invariant) — Dual audit + banner.** Every impersonation session writes to **both** the platform and tenant audit trails and shows a live banner inside the tenant while active; it auto-expires. `PLT-09`, `BR-N-14`

**`BR-O-04` (invariant) — Gated destruction.** `tenant:offboard` (Super-Admin only) triggers the confirmed data-deletion workflow; deletion is irreversible and fully logged. `PLT-06`

---
---

## 13. Cross-Cutting & Edge Cases (`BR-X`)

**`BR-X-01` (invariant) — Offline sync conflicts surface, never auto-pass.** If a synced check-in fails retroactive geofence/device validation, it is flagged for manager review, not silently accepted or dropped. `BR-A-08`

**`BR-X-02` (invariant) — Concurrency = first-commit-wins.** Simultaneous approvals resolve at the data layer: the first committed decision wins; the rest are rejected as "already decided." `BR-D-04`

**`BR-X-03` (invariant) — Time is stored UTC, shown AST.** All timestamps are stored in UTC and displayed in AST (UTC+3); Hijri is shown alongside Gregorian. Shift/lateness math uses the branch's timezone. `LOC-04/05`

**`BR-X-04` (invariant) — Overnight shifts.** A shift crossing midnight is attributed to its **shift**, not the calendar day, for lateness/absence math.

**`BR-X-05` (invariant) — No shift, no lateness.** A user with no assigned shift for a period can still check in (if permitted) but is neither `Late` nor `Absent` — those require an expected shift.

**`BR-X-06` (config) — Weekend & holidays.** Fri–Sat is the default weekend; configured KSA holidays suppress absence flags for those days. `SHF-06/07`

---
---

## Configurable vs Invariant — the line that must not blur

**Invariants (never a setting):** definition of completed (`BR-T-01`), submission gate (`BR-T-02`), no self-approval (`BR-D-05`), first-decision-wins (`BR-D-04`), consent-before-location (`BR-C-01`), deny-by-default (`BR-R-01`), plane isolation (`BR-R-05` / `BR-O-01`), dual-audit break-glass (`BR-O-02/03`), immutable audit (`BR-C-05`).

**Configurable (per company):** grace period, absence/cutoff thresholds, escalation timers, geofence radius, required-proof defaults, live-camera enforcement, overtime/labor rules, retention windows, quiet-hours/prayer windows, feature toggles (face, AI).

> **Rule of thumb:** anything touching **integrity, consent, isolation, or accountability** is an invariant. Anything touching **tolerance, timing, or policy** is configurable.

---

*Next in the chain: turn these rules + the flows into an SRS (acceptance criteria per feature), and a prioritized backlog (epics → user stories) where each story cites the rules it must satisfy.*
