# Ara Tasks — User Roles & Permissions

**Purpose:** Define every role in Ara Tasks and exactly what each one is allowed to do. This is the authority document for access control across **both planes** of the product:

- **Plane A — Platform (Operator):** the Ara Tasks company itself — the people who run the SaaS, manage tenants, plans, and support.
- **Plane B — Tenant (Customer):** the customer company that subscribes — Owner, Admin, Manager, Supervisor, Employee, and the support roles inside it.

It maps the `resource:action` permission model onto real people and shows the boundaries of each role.

**Relationship to other docs:** Builds on the permission model in the *Project Description* (Section 6) and the RBAC features in *Features Identification* / *Feature Catalog* (module `RBAC`). Ara Tasks is a **multi-tenant SaaS** (`APP-07`), so access control has two separate identity spaces that must never blur into each other.

---

## The Two Planes (read this first)

| | **Plane A — Platform** | **Plane B — Tenant** |
|---|---|---|
| **Who** | Ara Tasks staff (you + your team). | The customer's people. |
| **Manages** | Tenants, plans, feature flags, platform billing, support. | Their own branches, users, tasks, attendance, proof. |
| **Identity space** | Separate operator accounts (separate login, mandatory 2FA/SSO). | Tenant user accounts. |
| **Sees tenant operational data?** | **No — not by default. Ever.** Only via audited break-glass. | Yes, within their scope. |
| **Roles** | Super Admin, Platform Ops/Support, Platform Billing, Platform Auditor. | Owner, Admin, Manager, Supervisor, Employee, Auditor, Payroll Viewer, Billing Manager. |

**The golden rule of isolation:** A Platform role can manage the *account* (status, plan, seats, flags) but cannot read the *contents* (who was late, what tasks ran, proof photos, employee PII) without **explicit, time-boxed, doubly-audited break-glass access**. This is the core PDPL guarantee — Ara Tasks is the **processor**, not the owner, of tenant data.

---
---

# PLANE A — Platform (Ara Tasks Operator)

## Platform Principles

1. **Isolation by default.** No platform role inherits any tenant's operational data. Managing an account ≠ reading its contents.
2. **Break-glass, not backdoor.** The only path into a tenant's workspace is `tenant:impersonate`, and it is: consented (or contractually authorized), **time-boxed**, **least-privilege**, and **written to both the platform audit trail and the tenant's own audit trail** so the customer sees exactly when an operator entered.
3. **Separate auth boundary.** Platform accounts are a distinct identity space from tenant users — separate login, mandatory 2FA (or SSO), no shared credentials, no platform role ever appears in a tenant's role list.
4. **Least privilege for staff too.** Support does not get finance powers; finance does not get impersonation. Only Super Admin is broad.
5. **Infra ≠ app RBAC.** Access to databases, servers, and backups is governed by cloud IAM and infrastructure security — **not** by these application permissions. This document covers the app plane only; infra access is a separate, tighter control.

---

## Platform Permission Registry

| Permission | What it allows | Sensitive |
|---|---|---|
| `tenant:view` | See the tenant list and account metadata (name, status, plan, seats, region). | ✔ |
| `tenant:provision` | Create/onboard a new tenant workspace. | ✔ |
| `tenant:lifecycle` | Suspend or reactivate a tenant account. | ✔ |
| `tenant:offboard` | Terminate a tenant and trigger the data-deletion workflow. | ✔✔ |
| `tenant:impersonate` | Break-glass access into a tenant's workspace (consent + time-boxed + doubly audited). | ✔✔ |
| `plan:manage` | Create/edit subscription plans, pricing, and included features. | ✔ |
| `feature_flag:manage` | Enable/disable platform or per-tenant feature flags (face verification, AI, etc.). | ✔ |
| `platform_billing:view` | View cross-tenant billing, invoices, and revenue. | — |
| `platform_billing:manage` | Refunds, credits, plan overrides, dunning actions. | ✔ |
| `platform_user:manage` | Manage internal Ara Tasks staff accounts. | ✔ |
| `platform_role:manage` | Create/edit platform roles and their permissions. | ✔ |
| `platform_audit:view` | Read the platform-wide audit trail (incl. cross-tenant access logs). | ✔ |
| `platform_audit:export` | Export platform audit logs for compliance. | ✔ |
| `platform_settings:manage` | Change platform-wide configuration. | ✔ |

> **On `tenant:impersonate`:** this is the single most sensitive permission in the entire system. It must always require an active, consented, time-limited session; default to **read-only** unless the tenant explicitly grants write; and surface a visible banner inside the tenant workspace while active. Every impersonation session is a first-class audit event on **both** sides.

---

## Platform Roles — at a glance

| Role | One-line persona | Holds |
|---|---|---|
| **Super Admin** | The Ara Tasks operator superuser. Runs the whole platform. | Everything on Plane A. |
| **Platform Ops / Support** | Onboards customers, handles support, helps enable features. | Account + support powers, gated break-glass. No finance, no staff admin. |
| **Platform Billing / Finance** | Owns plans, pricing, and cross-tenant revenue. | Billing + plans only. No operational access. |
| **Platform Auditor / Compliance** | Reviews platform activity. Changes nothing. | Read-only + audit export. |

---

### A1. Super Admin

**Persona:** The Ara Tasks operator owner/lead. Full control of the platform.

**Can do:**
- Everything on Plane A: provision/suspend/terminate tenants, manage plans and feature flags, platform billing, manage internal staff and platform roles, read and export the platform audit trail, change platform settings.
- Authorize and perform break-glass (`tenant:impersonate`) under the isolation rules.

**Cannot do:**
- Read tenant operational data casually — even Super Admin must go through consented, audited impersonation. Power over the *account* is not silent access to the *contents*.

---

### A2. Platform Ops / Support

**Persona:** Customer success / support. Onboards new companies, resolves tickets, helps a customer turn on a feature.

**Can do:**
- View tenant accounts and their status/plan/seats (`tenant:view`).
- Provision new tenants and onboard them (`tenant:provision`).
- Suspend/reactivate an account when needed (`tenant:lifecycle`).
- Manage feature flags to enable/disable features per tenant (`feature_flag:manage`).
- View platform billing status to answer questions (`platform_billing:view`).
- Enter a tenant workspace **only** via gated break-glass (`tenant:impersonate`) — consented, time-boxed, audited on both sides.
- Read the platform audit trail (`platform_audit:view`).

**Cannot do:**
- Terminate/offboard a tenant or delete its data (`tenant:offboard` — Super Admin only).
- Manage plans/pricing or run refunds (finance powers).
- Manage internal staff accounts or platform roles.
- Access tenant operational data without an active impersonation session.

---

### A3. Platform Billing / Finance

**Persona:** The finance person on the Ara Tasks side. Owns the money across all tenants.

**Can do:**
- Create and edit subscription plans, pricing, and bundled features (`plan:manage`).
- View and manage cross-tenant billing: invoices, revenue, refunds, credits, dunning (`platform_billing:view`, `platform_billing:manage`).
- View tenant accounts to attach billing (`tenant:view`).

**Cannot do:**
- Impersonate tenants or touch operational data.
- Provision/suspend/terminate tenants, manage feature flags, staff, or platform settings.

---

### A4. Platform Auditor / Compliance

**Persona:** Internal or external compliance/audit for the Ara Tasks platform itself.

**Can do:**
- View tenant accounts and platform billing (read-only).
- Read and export the full platform audit trail, including every impersonation and access-log entry (`platform_audit:view`, `platform_audit:export`).

**Cannot do:**
- Any mutation — no provisioning, no lifecycle, no impersonation, no billing changes, no config.

---

## Platform Permission Matrix

Legend: **●** = granted by default · blank = not granted. All defaults are editable by Super Admin.

| Permission | Super Admin | Ops / Support | Billing / Finance | Auditor |
|---|:--:|:--:|:--:|:--:|
| `tenant:view` | ● | ● | ● | ● |
| `tenant:provision` | ● | ● | | |
| `tenant:lifecycle` | ● | ● | | |
| `tenant:offboard` | ● | | | |
| `tenant:impersonate` | ● | ● | | |
| `plan:manage` | ● | | ● | |
| `feature_flag:manage` | ● | ● | | |
| `platform_billing:view` | ● | ● | ● | ● |
| `platform_billing:manage` | ● | | ● | |
| `platform_user:manage` | ● | | | |
| `platform_role:manage` | ● | | | |
| `platform_audit:view` | ● | ● | ● | ● |
| `platform_audit:export` | ● | | | ● |
| `platform_settings:manage` | ● | | | |

---

## Cross-Plane Isolation Rules (non-negotiable)

- **No implicit read of tenant content.** Platform roles never see attendance, tasks, proof, or employee PII by default. The account is manageable; the contents are not readable without break-glass.
- **Break-glass is consented, time-boxed, least-privilege, and read-only by default.** Write access inside a tenant requires an explicit tenant grant.
- **Dual audit.** Every impersonation session writes to the platform audit trail **and** the tenant's own audit trail (`AUD`), with a visible in-workspace banner while active. The customer must always be able to see when an operator was inside.
- **Separate identity space.** Platform accounts and tenant accounts never share credentials or sessions. Platform roles are invisible to and unassignable by tenants.
- **PDPL processor obligations extend to the platform.** Operator access to personal data is a processing activity requiring lawful basis + records; data residency and access logging (`AUD-07`) apply here too.
- **Destructive actions are gated.** `tenant:offboard` (delete + data deletion) is Super-Admin-only and should require explicit confirmation and a retention/deletion workflow.

---
---

# PLANE B — Tenant (Customer Company)

Everything below governs access **inside a single customer's workspace**. It never crosses tenant boundaries — a Tenant Owner is the top of *their* company, not the platform.

## Core Principles

1. **`resource:action`.** Every capability is one explicit permission (e.g. `task:approve`, `user:invite`). There are no vague, all-or-nothing roles.
2. **A role is just a bundle of permissions.** The eight default roles below ship ready-made but are **fully editable**, and custom roles can be built from scratch.
3. **Every permission is scoped.** It is always evaluated inside the user's assigned scope — *company / branch / department / team / self*. Holding `task:approve` at branch scope does **not** grant it company-wide.
4. **Least privilege by default.** Each default role holds only what its persona needs. Widen deliberately, never by accident.
5. **Sensitive actions are logged.** Every approval, permission change, and correction is written to the tenant's audit trail with the actor's name (see `AUD`).

> **"Company" here means the tenant's workspace**, not the Ara Tasks platform. A Tenant Owner controls their whole company but has zero visibility into other tenants or the platform plane.

---

## Scope Model

Scope answers *"over which slice of the company does this permission apply?"* It cascades downward — a permission at a higher scope covers everything beneath it.

| Scope | Covers | Typical holder |
|---|---|---|
| **Company** | The entire workspace, all branches. | Owner, Admin |
| **Branch** | One physical location and everything in it. | Branch Manager |
| **Department** | One function, possibly across several branches. | Department head / ops supervisor |
| **Team** | A small working group inside a branch/department. | Supervisor / team lead |
| **Self** | Only the user's own records. | Employee |

**Cascade rule:** a Manager scoped to a branch sees every department, team, and employee inside that branch — all the way down. A Supervisor scoped to a team sees only that team.

---

## Tenant Permission Registry (master list)

| Permission | What it allows | Sensitive |
|---|---|---|
| `user:view` | See user profiles within scope. | — |
| `user:create` | Add new users. | ✔ |
| `user:update` | Edit user profiles, org assignment, managers. | ✔ |
| `user:delete` | Deactivate/delete users. | ✔ |
| `user:invite` | Send join invitations. | ✔ |
| `role:view` | See roles and their permissions. | — |
| `role:create` | Build new custom roles. | ✔ |
| `role:update` | Edit permissions inside any role. | ✔ |
| `role:assign` | Attach roles to users within a scope. | ✔ |
| `branch:manage` | Create/edit/archive branches, geofences, hours. | ✔ |
| `department:manage` | Create/edit departments (incl. cross-branch). | ✔ |
| `team:manage` | Create/edit teams. | ✔ |
| `shift:manage` | Define/assign shifts, grace, overtime, patterns. | ✔ |
| `attendance:view` | See attendance records and presence. | — |
| `attendance:correct` | Request a correction to an attendance record. | ✔ |
| `attendance:approve` | Approve/reject attendance corrections. | ✔ |
| `task:view` | See tasks within scope. | — |
| `task:create` | Create one-time/recurring tasks, checklists. | — |
| `task:assign` | Assign/reassign a task to a person or team. | — |
| `task:approve` | Approve submitted work. | ✔ |
| `task:reject` | Reject work and reopen it. | ✔ |
| `task:reassign` | Move a task to another assignee. | — |
| `proof:view` | View the proof gallery for a task. | — |
| `proof:submit` | Attach proof (photo/note/checklist) to a task. | — |
| `report:view` | Open dashboards and reports within scope. | — |
| `report:export` | Export reports to PDF/Excel/CSV. | ✔ |
| `billing:view` | See plans, invoices, payment history. | — |
| `billing:manage` | Change plan, payment method, run charges. | ✔ |
| `settings:view` | See company/attendance/localization settings. | — |
| `settings:update` | Change settings, policies, retention, toggles. | ✔ |
| `audit:view` | Read the tenant audit trail. | ✔ |
| `ai:use` | Use AI features (assistant, digest, NL tasks). | — |
| `ai:configure` | Enable/tune AI per company. | ✔ |

> **Note on check-in/out:** the act of clocking in/out is available to any *active* user with an assigned shift, at **self** scope. It is governed by device binding + geofence — not by a management permission. The `attendance:*` permissions above govern *viewing, correcting, and approving* attendance, not the personal act of checking in.

---

## The Eight Default Tenant Roles — at a glance

| Role | One-line persona | Default scope |
|---|---|---|
| **Owner** | The business owner. Sees and controls everything in their company. | Company |
| **Admin** | Runs the operation day to day: users, org, shifts, tasks, settings. | Company |
| **Manager** | Runs a branch/department: approves work, follows up, handles escalations. | Branch / Department (+ below) |
| **Supervisor** | Runs a team on the ground: assigns and approves day-to-day work. | Team (or Department) |
| **Employee** | Does the work: checks in, sees tasks, submits proof. | Self |
| **Auditor** | Reviews everything, changes nothing. Read-only + audit trail. | Company (read-only) |
| **Payroll Viewer** | Pulls attendance data for payroll. Read + export only. | Company / assigned |
| **Billing Manager** | Owns the subscription and payments. Nothing else. | Company (billing only) |

---
---

# Tenant Role-by-Role Breakdown

## 1. Owner

**Persona:** The business owner — the person Ara Tasks was built for. Wants the full picture across every branch without chasing anyone.

**Default scope:** Company (tenant superuser).

**Can do:**
- Everything within their company. The Owner holds every tenant permission at company scope.
- Create and edit any role, including reshaping the defaults.
- Manage billing, settings, AI configuration, and data-retention policy.
- View the full tenant audit trail.

**Cannot do:**
- Nothing is withheld by default *within their company*. (They may hand billing to a Billing Manager or ops to an Admin, but retain authority to take it back.)
- See any other tenant or the platform plane — the Owner's world ends at their company boundary.

---

## 2. Admin

**Persona:** The operations lead who actually runs the account day to day — sets up users, branches, departments, shifts, and tasks, and tunes settings.

**Default scope:** Company.

**Can do:**
- Full user lifecycle: create, edit, invite, deactivate, assign to org and managers.
- Manage the whole org structure: branches, departments, teams, shifts.
- Create, assign, approve, reject, and reassign tasks.
- View and approve attendance corrections.
- Create and edit roles, and assign them.
- View and export all reports; view billing; view the audit trail.
- Change company/attendance/localization settings; use and configure AI.

**Cannot do (by default — editable):**
- **Manage billing** (`billing:manage`) — the subscription and payment method are left to the Owner / Billing Manager for separation of duties. Admin can *view* billing.
- Nothing else is structurally blocked; Admin is intentionally powerful. Narrow it per client if needed.

---

## 3. Manager

**Persona:** A branch or department manager. Runs their slice of the operation, approves work, follows up on their team, and handles escalations — mostly from their phone. Can sit at any level of the hierarchy.

**Default scope:** Their assigned branch/department, cascading down to every team and employee beneath them.

**Can do:**
- See their whole team's users, attendance, tasks, and proof (within scope).
- Invite new users into their scope.
- Manage their teams and shifts (define, assign, set patterns).
- Full task control in scope: create, assign, approve, reject, reassign.
- Approve/reject attendance corrections.
- View and export reports for their scope; use AI (assistant, digest).

**Cannot do:**
- Create, edit, or delete users outright (invite only — full user admin stays with Admin/Owner).
- Manage branches or departments, or edit roles/permissions.
- Touch billing, company settings, AI configuration, or the audit trail.
- Act **outside their scope** — a branch manager cannot approve another branch's tasks.

---

## 4. Supervisor

**Persona:** A team lead or shift supervisor on the ground. Lighter than a Manager: assigns and signs off day-to-day work, but doesn't run org structure or scheduling.

**Default scope:** Their team (or a single department).

**Can do:**
- See their team's users, attendance, tasks, and proof.
- Full task control in scope: create, assign, approve, reject, reassign.
- Approve/reject attendance corrections.
- View their team dashboard/reports.

**Cannot do:**
- Manage shifts, teams, branches, or departments (viewing only).
- Invite or administer users; edit roles.
- Export reports, touch billing/settings/audit, or configure AI.
- Act outside their team scope.

> **Manager vs. Supervisor:** same task/approval powers, but the Manager owns a wider scope plus shift/team management, user invitation, report export, and AI use. Supervisor is the narrower, on-the-floor version.

---

## 5. Employee

**Persona:** The frontline worker. Opens the app, checks in, sees today's tasks, does them, uploads proof, and gets on with the job. Everything is dead-simple and self-scoped.

**Default scope:** Self.

**Can do:**
- Check in / check out (governed by device binding + geofence).
- View their own attendance timeline and request corrections.
- View their own assigned tasks and their checklists.
- Submit proof (photo, note, completed checklist) and mark work as submitted.
- View and lightly edit their own profile; see their "My Day" dashboard.

**Cannot do:**
- See anyone else's data — no other employees, no branch-wide view.
- Create, assign, approve, or reject tasks.
- Approve their own attendance corrections (a manager must).
- Access reports, settings, billing, roles, org structure, or audit.

---

## 6. Auditor

**Persona:** A reviewer or compliance role inside the customer company. Needs to see everything to verify it, but must never change anything.

**Default scope:** Company, read-only (can be narrowed to a branch/region).

**Can do:**
- View users, roles, attendance, tasks, proof, reports, billing, and settings within scope.
- Export reports.
- Read the full tenant audit trail.

**Cannot do:**
- Any mutation whatsoever — no create, update, delete, assign, approve, reject, or manage.
- Change settings, roles, billing, or configure AI.

---

## 7. Payroll Viewer

**Persona:** The payroll or HR person who needs clean attendance data to run payroll — and nothing more.

**Default scope:** Company or an assigned branch/department (the payroll slice).

**Can do:**
- View users (names/identifiers) and attendance records in scope.
- View and export attendance/payroll-relevant reports.

**Cannot do:**
- See or touch tasks, proof, roles, org structure, settings, billing, audit, or AI.
- Change any record — this role is strictly read + export.

---

## 8. Billing Manager

**Persona:** Whoever owns the money side inside the customer company — the subscription, the plan, and the payment method. Often the Owner, sometimes a finance person.

**Default scope:** Company (billing only).

**Can do:**
- View plans, invoices, receipts, and payment history.
- Manage the subscription: change plan, update payment method, handle renewals/proration, apply discounts.

**Cannot do:**
- See or manage users, org structure, tasks, attendance, reports, settings, audit, or AI.
- This role is deliberately narrow — money in, nothing else.

---
---

# Master Tenant Permission Matrix

Legend: **●** = granted by default · **○** = granted at **self** scope only · blank = not granted.
Every ● is still bounded by the role's assigned scope (see per-role sections). All defaults are editable.

| Permission | Owner | Admin | Manager | Supervisor | Employee | Auditor | Payroll V. | Billing M. |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| `user:view` | ● | ● | ● | ● | ○ | ● | ● | |
| `user:create` | ● | ● | | | | | | |
| `user:update` | ● | ● | | | ○ | | | |
| `user:delete` | ● | ● | | | | | | |
| `user:invite` | ● | ● | ● | | | | | |
| `role:view` | ● | ● | | | | ● | | |
| `role:create` | ● | ● | | | | | | |
| `role:update` | ● | ● | | | | | | |
| `role:assign` | ● | ● | | | | | | |
| `branch:manage` | ● | ● | | | | | | |
| `department:manage` | ● | ● | | | | | | |
| `team:manage` | ● | ● | ● | | | | | |
| `shift:manage` | ● | ● | ● | | | | | |
| `attendance:view` | ● | ● | ● | ● | ○ | ● | ● | |
| `attendance:correct` | ● | ● | | | ○ | | | |
| `attendance:approve` | ● | ● | ● | ● | | | | |
| `task:view` | ● | ● | ● | ● | ○ | ● | | |
| `task:create` | ● | ● | ● | ● | | | | |
| `task:assign` | ● | ● | ● | ● | | | | |
| `task:approve` | ● | ● | ● | ● | | | | |
| `task:reject` | ● | ● | ● | ● | | | | |
| `task:reassign` | ● | ● | ● | ● | | | | |
| `proof:view` | ● | ● | ● | ● | | ● | | |
| `proof:submit` | ● | | | | ○ | | | |
| `report:view` | ● | ● | ● | ● | | ● | ● | |
| `report:export` | ● | ● | ● | | | ● | ● | |
| `billing:view` | ● | ● | | | | ● | | ● |
| `billing:manage` | ● | | | | | | | ● |
| `settings:view` | ● | ● | | | | ● | | |
| `settings:update` | ● | ● | | | | | | |
| `audit:view` | ● | ● | | | | ● | | |
| `ai:use` | ● | ● | ● | | | | | |
| `ai:configure` | ● | ● | | | | | | |

---
---

# Custom Tenant Roles

Default roles are a starting point. When they don't fit, build a custom role from the registry — no developer required (`role:create`, `role:update`).

**How:** pick permissions from the registry, then assign the role to users **at a chosen scope**. The same role assigned at different scopes behaves differently (e.g. a "Shift Lead" role assigned to team A only governs team A).

**Worked examples:**

| Custom role | Permissions | Scope | Why you'd build it |
|---|---|---|---|
| **Shift Lead** | `attendance:view`, `attendance:approve`, `task:view`, `task:approve`, `task:reject` | Team | A trusted employee who signs off work and attendance for one shift, nothing more. |
| **Regional Manager** | Full Manager bundle | Multiple branches (region) | A Manager whose scope spans several branches once you group them. |
| **HQ Read-only Viewer** | All `*:view` permissions | Company | A stakeholder who needs the full picture but must never change anything (lighter than Auditor — no audit access). |
| **Ops Auditor** | `audit:view`, `report:view`, `report:export` | Company | Internal audit that only touches the trail and reports. |
| **Task-only Supervisor** | `task:*`, `proof:view` | Department | Someone who runs tasks but is explicitly barred from attendance decisions. |

---

# Rules & Edge Cases

- **Two planes never mix.** A tenant role can never gain a platform permission, and a platform role can never silently gain tenant data access. They are separate identity spaces.
- **Multiple roles stack.** A user with several roles gets the **union** of their permissions (`RBAC-09`). Wearing two hats is expected.
- **Scope always wins.** A permission never applies outside the user's assigned scope, no matter how it was granted.
- **Multi-manager approvals (resolved decision).** When an employee has several managers, **any in-scope manager holding the right permission** (`task:approve`, `attendance:approve`) can act, and the **first valid decision locks the item** (`APR-04`) — logged with the decider's name. Every employee still has exactly **one Primary Manager** as the accountable line for payroll and escalation.
- **Editing defaults is safe and reversible.** Changing a default role affects only that company's tenant. Reset to the shipped default at any time.
- **Every sensitive grant is logged.** Creating a role, editing permissions, or assigning a role is written to the audit trail (`AUD-04` / `RBAC-10`).
- **Permission-aware UI ≠ security.** The UI hides actions a user can't perform (`RBAC-08`), but enforcement is server-side on every request (`RBAC-07`) — the client is never trusted.

---

*Next in the chain: (1) add a **Platform / Operator Console** module to Features Identification & Feature Catalog so the platform plane is traced as features, not just roles; (2) turn the backlog into an SRS with acceptance criteria per feature; (3) define the concrete scope-assignment UX (how an Owner attaches a role to a user at a branch/department/team).*
