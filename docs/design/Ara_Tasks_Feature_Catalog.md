# Ara Tasks — Feature Catalog

**Purpose:** For every feature in Ara Tasks, this document answers three questions: **What does it do? Who uses it? Why does it exist?** The "why" is deliberately tied back to the owner's real pains — blindness across branches, WhatsApp chaos, reacting late, gut-feeling decisions, and "present is not the same as productive."

**Relationship to other docs:** This is the explanatory companion to *Features Identification*. Same 17 modules (modules 1–16 = Tenant plane, module 17 = Platform / Operator plane), same feature IDs, same phase split (MVP first). Use *Identification* for phase/priority/permissions; use this catalog to understand and justify each feature.

**Roles referenced:** Owner (O), Admin (A), Manager (M), Supervisor (S), Employee (E), Auditor (Au), Payroll Viewer (PV), Billing Manager (BM), System (automatic, no human trigger).

---
---

# PART 1 — MVP (Phase 1 · KSA Launch)

## 1. Organization & Structure

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Company/Workspace setup (ORG-01)** | Creates the top-level tenant that owns every branch, user, task, and record below it. | Owner, Admin | Every account needs one isolated root; it's the container that makes "one place for the whole operation" possible. |
| **Branch management (ORG-02)** | Create, edit, and archive physical locations, each with GPS coordinates. | Owner, Admin | The owner's world is multi-branch; attendance and tasks only mean something when tied to a specific place. |
| **Branch geofence (ORG-03)** | Defines a radius or polygon boundary around each branch. | Owner, Admin | So "at the branch" is a fact the system checks, not an honor-system claim. |
| **Branch working hours & timezone (ORG-04)** | Sets each branch's operating hours and pins it to AST. | Owner, Admin | Lateness and absence are meaningless without knowing when a branch is supposed to be open. |
| **Department management (ORG-05)** | Creates functional units (sales, cleaning, maintenance…). | Owner, Admin | Lets the owner report and manage by *function*, not just by location. |
| **Cross-branch departments (ORG-06)** | Allows one department to span several branches. | Owner, Admin | A maintenance crew serving every branch is real; the model must match the company, not flatten it. |
| **Team management (ORG-07)** | Optional small working groups inside a branch/department. | Owner, Admin, Manager | The unit where day-to-day assignment and follow-up actually happen. |
| **Multi-level reporting chain (ORG-08)** | Employees report to managers, who report to managers above them, several levels deep. | Owner, Admin | Mirrors how the business is actually run and powers the visibility cascade. |
| **Matrix reporting (ORG-09)** | Lets one employee have more than one manager. | Owner, Admin | A warehouse worker answers to both the branch manager and the ops supervisor — the system has to allow that. |
| **Primary Manager (ORG-10)** | Designates exactly one accountable manager per employee. | Owner, Admin | Even in a matrix, there must be one clear line for payroll, performance, and escalation — no finger-pointing. |
| **Scope resolution engine (ORG-11)** | Computes who can see and act on what, based on hierarchy + scope. | System | The backbone that makes "everyone sees only their slice" true and enforceable everywhere. |

## 2. Users & Identity

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **User CRUD (USR-01)** | Create, edit, deactivate, and delete users. | Owner, Admin | The basic roster; you can't manage people you can't add and remove. |
| **User invitation (USR-02)** | Invites people via link, SMS, or email. | Owner, Admin, Manager | Fast onboarding of a distributed workforce without manual account setup. |
| **User profile (USR-03)** | Stores contact info, job title, Iqama/National ID, and employment data. | Owner, Admin | The identity record every other module hangs off; also where PDPL-sensitive fields live. |
| **Org assignment (USR-04)** | Places a user into a branch, department, and/or team. | Owner, Admin | Assignment is what puts a person inside a scope; without it, permissions have nothing to bind to. |
| **Manager assignment (USR-05)** | Attaches one or more managers and marks the primary one. | Owner, Admin | Wires each employee into the reporting chain (ORG-09/10). |
| **Authentication (USR-06)** | Phone/email + password login. | Everyone | The front door — no access without proving identity. |
| **OTP (SMS) login (USR-07)** | One-time-code login over SMS. | Everyone | KSA is phone-first; frontline staff shouldn't wrestle with passwords. |
| **Password reset / recovery (USR-08)** | Self-service account recovery. | Everyone | Keeps locked-out staff from becoming a support burden on the owner. |
| **Device binding (USR-09)** | Binds each user to one registered device. | Employee, Manager | The single most effective, cheap defense against clocking in for an absent friend. |
| **Device re-bind approval (USR-10)** | Requires a request + approval to change the bound device. | Employee, Manager, Admin | Stops silent device swaps that would defeat the whole binding control. |
| **User status (USR-11)** | Marks users active / invited / suspended / deactivated. | Owner, Admin | Controls who can actually operate in the system at any moment. |
| **Employee self-profile (USR-12)** | Lets employees view and lightly edit their own profile. | Employee | Reduces admin workload and gives staff a sense of ownership over their data. |

## 3. Roles & Permissions

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Permission registry (RBAC-01)** | Central catalog of every `resource:action` key. | System | The single source of truth that keeps permissions explicit instead of vague. |
| **Default roles (RBAC-02)** | Ships ready-made roles (Owner, Admin, Manager, Supervisor, Employee, Auditor, Payroll Viewer, Billing Manager). | Owner, Admin | So most clients never touch raw permissions — prevents the "over-engineering" risk. |
| **Custom role creation (RBAC-03)** | Builds new roles from bundles of permissions. | Owner, Admin | The owner wanted to shape exact roles (e.g. "approve tasks but never touch billing") without a developer. |
| **Edit roles (RBAC-04)** | Modifies the permissions inside any role, including defaults. | Owner, Admin | Defaults are a starting point, not a cage — roles must bend to the business. |
| **Assign roles (RBAC-05)** | Attaches roles to users within a scope. | Owner, Admin | Connects the permission model to real people in real branches. |
| **Scoped permission model (RBAC-06)** | Evaluates every permission at company/branch/department/team/self. | System | `task:approve` at one branch must not leak company-wide — scope is the whole point. |
| **Enforcement middleware (RBAC-07)** | Enforces permissions on the backend for every request. | System | UI hiding isn't security; the server is where access is truly guaranteed. |
| **Permission-aware UI (RBAC-08)** | Hides or disables actions a user can't perform. | Everyone | Keeps each person's screen clean and free of buttons that would only error out. |
| **Multiple roles per user (RBAC-09)** | Lets a user hold several stacked roles (union of permissions). | Owner, Admin | Real people wear multiple hats; one role per person is too rigid. |
| **Permission change logging (RBAC-10)** | Records every role/permission edit. | System, Auditor | Access changes are sensitive; who granted what must be traceable. |

## 4. Shifts & Scheduling

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Shift definition (SHF-01)** | Defines start/end times and breaks. | Owner, Admin, Manager | The baseline the whole attendance engine measures against. |
| **Shift assignment (SHF-02)** | Assigns shifts to users or teams. | Owner, Admin, Manager | Tells the system who is expected where and when. |
| **Recurring shift patterns (SHF-03)** | Weekly and rotating schedules. | Owner, Admin, Manager | Most operations run repeating rotas; re-entering them daily would be absurd. |
| **Lateness/grace threshold (SHF-04)** | Configurable grace period before "late". | Owner, Admin | Fairness — a two-minute delay shouldn't be flagged like a two-hour one. |
| **Overtime rules (SHF-05)** | Configurable OT logic per KSA labor law. | Owner, Admin | Labor rules differ and change; hardcoding them would break compliance. |
| **Weekend = Fri–Sat (SHF-06)** | Sets the Saudi working week as default. | System | A launch-market baseline; a Mon–Fri default would be wrong on day one. |
| **KSA holiday calendar (SHF-07)** | Bakes in public holidays. | Owner, Admin | Prevents holidays from being wrongly flagged as mass absence. |
| **Prayer-time-aware shifts (SHF-08)** | Adjusts schedules around prayer times. | Owner, Admin | A local reality of Saudi operations; ignoring it makes the product feel foreign. |
| **Ramadan working hours (SHF-09)** | Reduced/adjusted-hours mode. | Owner, Admin | Saudi labor practice shifts in Ramadan; the system must follow, not fight it. |

## 5. Attendance

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Check-in / check-out (ATT-01)** | The core action of starting and ending a work session. | Employee, Manager | The front door of the whole product — everything else builds on it. |
| **GPS capture (ATT-02)** | Records location at check-in/out. | Employee (captured automatically) | Turns "I was there" into a coordinate the system can verify. |
| **Geofence validation (ATT-03)** | Confirms the user is inside the branch boundary. | System | Blocks check-ins from home, the car, or across town. |
| **Device-bound check-in (ATT-04)** | Verifies the check-in came from the registered device. | System | The direct answer to "nobody clocks in for a friend who isn't there." |
| **Lateness detection (ATT-05)** | Flags late arrivals against shift + grace. | System | Gives the owner hard numbers on lateness instead of impressions. |
| **Absence detection (ATT-06)** | Flags no-shows against the schedule. | System | Surfaces the no-show the *morning* it happens, not after a customer complains. |
| **Early-departure detection (ATT-07)** | Flags leaving before shift end. | System | "Present at 8" means nothing if they vanish at 10; this closes that gap. |
| **Correction request (ATT-08)** | Lets an employee request an attendance fix. | Employee | GPS and phones fail; people deserve a fair path to correct honest errors. |
| **Correction approval (ATT-09)** | Manager approves or rejects the correction. | Manager, Supervisor | Keeps corrections honest — a fix needs a human sign-off, logged. |
| **Missed check-out handling (ATT-10)** | Auto-closes or flags forgotten open sessions. | System | Prevents a forgotten check-out from silently logging a 14-hour shift. |
| **Employee attendance timeline (ATT-11)** | Full attendance history per person. | Employee, Manager | The record the owner never had — reviewable, not lost in a chat. |
| **"Who's in now" board (ATT-12)** | Real-time presence per branch. | Manager, Owner | The live answer to "who actually showed up today?" across every site. |
| **Offline check-in + sync (ATT-13)** | Captures locally and syncs when back online. | Employee | Sites have weak signal; attendance can't depend on perfect connectivity. |
| **Mock-location detection (ATT-14)** | Basic guard against GPS-spoofing apps. | System | Closes the obvious loophole of faking location to beat the geofence. |

## 6. Tasks

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **One-time task (TSK-01)** | Creates a single task. | Manager, Supervisor, Admin | The atomic unit of "what someone is supposed to do." |
| **Recurring task (TSK-02)** | Daily/weekly repeating tasks. | Manager, Supervisor, Admin | The morning opening checklist should generate itself, not be retyped daily. |
| **Task assignment (TSK-03)** | Assigns a task to a person or team. | Manager, Supervisor | A task with no owner is a task nobody does. |
| **Priority (TSK-04)** | Sets a priority level. | Manager, Supervisor | Tells staff what matters most when the day gets busy. |
| **Deadline (TSK-05)** | Sets a due date/time. | Manager, Supervisor | "Done eventually" isn't accountability; a deadline makes it real. |
| **Checklist / subtasks (TSK-06)** | Breaks a task into steps. | Manager, Supervisor, Employee | Ensures the whole routine runs, and doubles as lightweight proof. |
| **Task lifecycle (TSK-07)** | Drives open → in progress → submitted → approved/rejected → reopened. | Employee, Manager | The state machine that turns "I hope it got done" into a tracked flow. |
| **Task reassignment (TSK-08)** | Moves a task to another assignee. | Manager, Supervisor | People call in sick; work must be re-routed without being recreated. |
| **Task categories/tags (TSK-09)** | Classifies tasks. | Manager, Supervisor | Makes reporting by type possible (cleaning vs. inventory vs. maintenance). |
| **Task comments (TSK-10)** | A discussion thread on a task. | Employee, Manager | Keeps context on the task itself instead of scattered across WhatsApp. |
| **Location-bound tasks (TSK-11)** | Requires being at the branch to complete. | System | For work that can only be verified on-site, presence becomes part of "done." |
| **Overdue flag (TSK-12)** | Marks tasks past their deadline. | System | The trigger that feeds alerts and escalation so nothing quietly piles up. |

## 7. Proof of Work

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Photo proof (PRF-01)** | Attaches a photo to a task. | Employee | The clearest form of "here's the proof it got done." |
| **Note/text proof (PRF-02)** | Attaches a written note. | Employee | Some work is explained better than photographed. |
| **Checklist-as-proof (PRF-03)** | Counts a completed checklist as proof. | Employee | Low-friction evidence for routine, step-based work. |
| **GPS pin on proof (PRF-04)** | Stamps location onto the proof. | System | Ties the evidence to a place, not just a claim. |
| **Proof metadata (PRF-05)** | Records timestamp and device on every proof. | System | Answers "when and on what" — the details that make proof trustworthy. |
| **Proof gallery (PRF-06)** | Shows all proof for a task in one view. | Manager, Owner | Lets the owner *see* the work instead of hearing about it. |
| **Multiple proof items (PRF-07)** | Allows several pieces of proof per task. | Employee | A real job often needs more than one photo or note. |
| **Proof-required enforcement (PRF-08)** | Blocks submission until required proof exists. | System | This is what makes "done" actually mean done. |
| **Live-camera-only capture (PRF-09)** | Forces a live photo; blocks gallery uploads. | System | Stops recycling an old photo to fake completion. |

## 8. Approvals & Escalations

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Task approve/reject (APR-01)** | Manager decides on submitted work from their phone. | Manager, Supervisor | Control from anywhere — the manager doesn't have to be on-site to sign off. |
| **Reject + reopen (APR-02)** | Rejects with a reason and reopens for redo. | Manager, Supervisor | Substandard work should be fixed, not silently accepted. |
| **Attendance correction approval (APR-03)** | Approves/rejects attendance fixes. | Manager, Supervisor | Keeps the attendance record clean and human-verified. |
| **First-decision-wins lock (APR-04)** | The first valid manager decision locks the item. | System | Solves the multi-manager problem — no double approvals, no conflict. |
| **Escalation on no-response (APR-05)** | Climbs the primary line when no one acts in time. | System | Delivers the same-day intervention the owner is paying for. |
| **Escalation fan-out (APR-06)** | Notifies other in-scope managers if the primary stalls. | System | A single unavailable manager shouldn't freeze the whole operation. |
| **Approval inbox (APR-07)** | A per-manager queue of pending decisions. | Manager, Supervisor | One place to clear decisions instead of hunting through notifications. |
| **Configurable escalation timers (APR-08)** | Sets how long before escalation triggers. | Owner, Admin | Urgency differs by business; the owner tunes the clock. |

## 9. Reports & Dashboards

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Owner dashboard (RPT-01)** | Company-wide picture across all branches. | Owner | The whole point — the full picture without chasing anyone. |
| **Manager dashboard (RPT-02)** | A scoped team/department view. | Manager, Supervisor | Managers act on their slice without wading through the whole company. |
| **Employee dashboard (RPT-03)** | "My day" — today's tasks and attendance. | Employee | One simple screen so staff know exactly what to do. |
| **Attendance report (RPT-04)** | Lateness/absence breakdown. | Owner, Manager | Replaces gut feeling about "who's always late" with data. |
| **Task completion report (RPT-05)** | Completion counts and status. | Owner, Manager | Shows what actually got done, branch by branch. |
| **On-time completion % (RPT-06)** | KPI for tasks done before deadline. | Owner, Manager | A headline success metric; measures reliability, not just activity. |
| **Proof-coverage % (RPT-07)** | Share of tasks with valid proof attached. | Owner, Manager | Measures how much "done" is actually backed by evidence. |
| **Branch comparison (RPT-08)** | Ranks and compares branches on real data. | Owner | Kills office politics — branches are judged on facts, fairly. |
| **Drill-down (RPT-09)** | Navigates company → branch → employee. | Owner, Manager | Lets the owner chase a bad number down to its exact source. |
| **Export (RPT-10)** | PDF / Excel / CSV export. | Owner, Manager, Auditor | Reports must leave the app for payroll, audits, and stakeholders. |
| **Real-time KPI widgets (RPT-11)** | Live tiles on dashboards. | Owner, Manager | Real-time visibility, not yesterday's snapshot. |
| **Time-to-intervention metric (RPT-12)** | Time from a problem to a manager acting. | Owner | Directly measures the "catch it same day" promise. |

## 10. Notifications & Alerts

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Push notifications (NOT-01)** | Mobile push delivery. | Everyone | The fastest way to reach a distributed workforce on the ground. |
| **In-app notification center (NOT-02)** | A central feed of alerts. | Everyone | So nothing important gets lost between push messages. |
| **Task alerts (NOT-03)** | Notifies on assigned / updated / overdue. | Employee, Manager | Keeps work moving without someone verbally chasing it. |
| **Approval-needed alerts (NOT-04)** | Tells managers a decision is pending. | Manager, Supervisor | Approvals shouldn't wait just because a manager didn't check the app. |
| **Lateness/absence alerts (NOT-05)** | Notifies managers in real time. | Manager, Supervisor | The moment-of-truth alert that enables same-day intervention. |
| **Escalation alerts (NOT-06)** | Notifies up the chain on no-response. | Manager, Supervisor | Ensures an ignored problem rises instead of dying silently. |
| **Email notifications (NOT-07)** | Email channel for key events. | Everyone | A durable, searchable channel for people not always in the app. |
| **Notification preferences (NOT-08)** | Per-user channel and event settings. | Everyone | Prevents alert fatigue by letting people tune the noise. |

## 11. Billing & Subscriptions

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Subscription plans (BIL-01)** | Defines pricing tiers/plans. | Owner, Billing Manager | The revenue model — how Ara Tasks itself gets paid. |
| **Trial management (BIL-02)** | Handles the free-trial period. | System | Lets businesses prove the value before paying, lowering the barrier to adopt. |
| **Account status lifecycle (BIL-03)** | Moves accounts through trial → active → grace → suspended. | System | Gates access based on payment state, fairly and automatically. |
| **MyFatoorah integration (BIL-04)** | Collects payments via MyFatoorah. | Billing Manager | The local, trusted payment rail for the Saudi market. |
| **Per-seat pricing (BIL-05)** | Charges by number of active users. | Billing Manager | Pricing that scales with the size of the customer's operation. |
| **Invoices & receipts (BIL-06)** | Generates basic invoices and receipts. | Owner, Billing Manager | Businesses need records of what they paid (ZATCA compliance comes later). |
| **Payment history (BIL-07)** | Lists past payments. | Owner, Billing Manager | Transparency and a paper trail for the customer's own accounting. |
| **Auto-renewal & retries (BIL-08)** | Recurring charges with retry logic. | System | Reduces involuntary churn from a single failed charge. |
| **Dunning / grace comms (BIL-09)** | Notifies on failed payment and the grace window. | System, Billing Manager | Gives customers a chance to fix payment before losing access. |

## 12. Audit & Logging

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Audit trail (AUD-01)** | Logs every sensitive action. | Auditor | The record of accountability the owner never had with WhatsApp. |
| **Immutable records (AUD-02)** | Stores who/what/when, tamper-resistant. | System | A log that can be edited proves nothing; integrity is the point. |
| **Decision logging (AUD-03)** | Records approval decisions with the decider's name. | System | Settles "who approved this?" disputes instantly. |
| **Permission-change logging (AUD-04)** | Records role/permission edits. | System | Access is power; every change to it must be traceable. |
| **Audit log viewer (AUD-05)** | Filters and searches the trail. | Auditor | A log nobody can read is useless; this makes it reviewable. |

## 13. Localization & KSA Compliance

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Arabic-first UI (LOC-01)** | Ships with Arabic as the default language. | Everyone | The launch market is Saudi; the product must feel local from the first tap. |
| **RTL layout (LOC-02)** | Full right-to-left support. | Everyone | Arabic reads right-to-left; anything else looks broken to users. |
| **English toggle (LOC-03)** | Switches the UI to English. | Everyone | Mixed workforces include non-Arabic speakers. |
| **Hijri + Gregorian (LOC-04)** | Shows Hijri alongside Gregorian dates. | Everyone | Saudi business runs on both calendars. |
| **AST timezone (LOC-05)** | Uses UTC+3 throughout. | System | Every timestamp — attendance, deadlines, proof — must be locally correct. |
| **SAR currency (LOC-06)** | Uses Saudi Riyal for billing/display. | System | Billing in the customer's own currency, no conversion friction. |
| **PDPL consent capture (LOC-07)** | Records explicit consent for location data. | System | Location is sensitive data under PDPL; consent isn't optional, it's the law. |
| **Data retention policy (LOC-08)** | Configurable retention and deletion. | Owner, Admin | PDPL requires a clear policy for how long sensitive data is kept. |
| **In-region data residency (LOC-09)** | Hosts data in-region where feasible. | System | A compliance and trust requirement for Saudi customers. |
| **Configurable labor rules (LOC-10)** | Keeps overtime/hours logic editable, not hardcoded. | Owner, Admin | Labor regulations vary and change; the system must adapt without a rebuild. |

## 14. Platform & Apps

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Employee mobile app (APP-01)** | A dead-simple iOS/Android app for staff. | Employee | Adoption is the #1 risk; if it's not effortless, frontline staff won't use it. |
| **Manager mobile app (APP-02)** | Approvals and team follow-up from the phone. | Manager, Supervisor | Managers run the floor, not a desk; control has to be mobile. |
| **Web dashboard (APP-03)** | The admin/owner control panel. | Owner, Admin | Setup, configuration, and the big-picture view need a real screen. |
| **Offline mode + sync (APP-04)** | Captures data offline and syncs later. | Employee | Work sites have weak connectivity; the app must degrade gracefully. |
| **Push infrastructure (APP-05)** | The pipeline that delivers device notifications. | System | The plumbing every real-time alert depends on. |
| **Camera/GPS integration (APP-06)** | Uses native device sensors. | Employee | Attendance and proof are physically impossible without them. |
| **Multi-tenant architecture (APP-07)** | Isolates each company's data. | System | Data ownership stays with the client; no tenant can ever see another's data. |

## 15. Settings

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Company settings (SET-01)** | Core workspace configuration. | Owner, Admin | The control room for how the whole account behaves. |
| **Attendance policy settings (SET-02)** | Geofence radius, grace period, and rules. | Owner, Admin | Every business has different tolerances; these must be tunable, not fixed. |
| **Task settings (SET-03)** | Default priorities and proof requirements. | Owner, Admin | Sets sensible company-wide defaults so managers don't reconfigure each task. |
| **Localization settings (SET-04)** | Language, calendar, week, and timezone. | Owner, Admin | Lets each company confirm the local defaults that fit them. |
| **Notification settings (SET-05)** | Company-level notification defaults. | Owner, Admin | Sets the baseline signal-to-noise for the whole team. |

## 16. Platform / Operator Console — *Operator Plane*

> This module is the **Ara Tasks operator side** — how *you* run the SaaS. It is a separate plane from every customer's workspace. Roles: Super Admin, Platform Ops/Support, Platform Billing/Finance, Platform Auditor. The recurring "why" here is the same one: Ara Tasks is a multi-tenant SaaS and a **data processor**, so operators must run the business without silently reading customers' operational data.

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Operator console (PLT-01)** | A separate web console for Ara Tasks staff to run the whole platform. | Super Admin, Ops, Billing, Auditor | You can't run a SaaS from inside one customer's dashboard; the operator needs its own control room. |
| **Operator identity + 2FA/SSO (PLT-02)** | A distinct login for staff with mandatory 2FA/SSO. | Super Admin | Operator accounts are far more powerful than any tenant user; they need a separate, hardened identity space. |
| **Tenant directory (PLT-03)** | Lists every customer account with status, plan, seats, and region. | Super Admin, Ops, Billing, Auditor | The operator's home screen — see the whole customer base at a glance, metadata only, never contents. |
| **Tenant provisioning (PLT-04)** | Creates and onboards a new customer workspace. | Super Admin, Ops | New customers must be spun up cleanly and isolated from everyone else's data. |
| **Tenant lifecycle (PLT-05)** | Suspends or reactivates a customer account. | Super Admin, Ops | Non-payment, abuse, or a customer pause all need a clean on/off switch tied to account status. |
| **Tenant offboarding (PLT-06)** | Terminates a customer and runs the data-deletion workflow. | Super Admin | When a customer leaves, PDPL requires their data actually be deleted — not just hidden. |
| **Region / data-residency assignment (PLT-07)** | Pins a customer's data to an in-region location. | Super Admin, Ops | Saudi customers need their data hosted in-region; that choice is made at onboarding. |
| **Break-glass impersonation (PLT-08)** | Consented, time-boxed, read-only-by-default access into a customer's workspace. | Super Admin, Ops | Support sometimes must see what the customer sees — but only with permission, a time limit, and a full trail. |
| **Impersonation dual-audit + banner (PLT-09)** | Logs every impersonation on both sides and shows a live banner inside the customer's app. | System | The customer must always be able to see exactly when an operator entered — trust is the whole point. |
| **Subscription plan management (PLT-10)** | Creates and edits plans, pricing, and bundled features. | Super Admin, Billing | The plans customers subscribe to have to be defined and priced somewhere central. |
| **Plan → feature entitlements (PLT-11)** | Maps which features each plan unlocks. | Super Admin, Billing | Pricing tiers only mean something if a plan actually gates what the customer can use. |
| **Feature flag management (PLT-12)** | Toggles platform-wide or per-tenant flags (face verification, AI…). | Super Admin, Ops | Sensitive/heavy features must be rolled out and switched on per customer, safely. |
| **Platform billing dashboard (PLT-13)** | Shows cross-tenant revenue, invoices, and MRR. | Super Admin, Billing, Auditor | The operator needs to see the money across all customers, not one invoice at a time. |
| **Platform billing operations (PLT-14)** | Handles refunds, credits, plan overrides, and dunning. | Super Admin, Billing | Real billing has exceptions; finance needs the levers to fix them without engineering. |
| **Internal staff management (PLT-15)** | Manages Ara Tasks employee accounts. | Super Admin | The operator's own team needs to be added, removed, and controlled like any other roster. |
| **Platform role management (PLT-16)** | Creates and edits platform roles and their permissions. | Super Admin | Least privilege applies to staff too — support shouldn't hold finance powers, and vice versa. |
| **Platform audit trail (PLT-17)** | Logs every operator action, access, and impersonation. | Super Admin, Auditor | Operator power over customer accounts must be fully accountable — especially under PDPL. |
| **Platform settings (PLT-18)** | Platform-wide configuration. | Super Admin | The one place to govern how the whole platform behaves. |

---
---

# PART 2 — Full Product (Phase 2 & 3)

> These sit on top of the clean operational data the MVP generates: fast-follow intelligence and heavier compliance (Phase 2), then multi-market expansion (Phase 3).

## 1. Organization & Structure

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Org chart visualization (ORG-12)** | Draws the hierarchy and matrix as a visual map. | Owner, Admin | A picture makes a complex multi-manager structure understandable at a glance. |
| **Bulk org import (ORG-13)** | Imports branches/departments/teams in one go. | Owner, Admin | Large chains shouldn't hand-enter dozens of branches during onboarding. |
| **Regions / cost centers (ORG-14)** | Groups branches into regions for rollups. | Owner, Admin | Once expansion begins, the owner needs to report by region, not just branch. |

## 2. Users & Identity

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Two-factor authentication (USR-13)** | Adds 2FA on sensitive accounts. | Owner, Admin, Manager | Owner and admin accounts control everything; a password alone is too weak. |
| **Bulk user import (USR-14)** | CSV import of employees. | Owner, Admin | Onboarding hundreds of staff one by one is a non-starter. |
| **Employee document store (USR-15)** | Holds contracts, IDs, and certificates. | Owner, Admin | Consolidates HR paperwork (under PDPL retention rules). |
| **Shared-device exception mode (USR-16)** | An explicit path for one-phone-per-team cases. | Owner, Admin | Not everyone has a personal smartphone; the device-binding rule needs a sanctioned exception. |
| **SSO / SAML (USR-17)** | Enterprise single sign-on. | Admin | Larger clients require login through their own identity provider. |

## 3. Roles & Permissions

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Clone / template roles (RBAC-11)** | Duplicates a role as a starting point. | Owner, Admin | Faster than building a similar role from scratch each time. |
| **Delegated / time-bound permissions (RBAC-12)** | Grants temporary acting-manager rights. | Owner, Admin | Covers leave and absence without permanently widening someone's access. |

## 4. Shifts & Scheduling

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Shift swap requests (SHF-10)** | Employees trade shifts with approval. | Employee, Manager | Real life needs flexibility; swaps should be governed, not done over WhatsApp. |
| **Leave / time-off requests (SHF-11)** | Request and approve leave. | Employee, Manager | So planned absence isn't mistaken for a no-show. |
| **Predictive staffing (SHF-12)** | Suggests staffing from historical demand. | Owner, Manager | Moves scheduling from reactive to data-driven once enough history exists. |
| **Open shifts / self-scheduling (SHF-13)** | Publishes open slots employees can claim. | Manager, Employee | Fills gaps faster by letting staff opt in, cutting manager effort. |

## 5. Attendance

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Face verification (ATT-15)** | Optional biometric check at check-in. | Employee | The strongest anti-impersonation control — deliberately deferred until consent/retention is nailed down. |
| **Face-verification consent (ATT-16)** | Records explicit consent before face is enabled. | Employee | Biometrics are sensitive under PDPL; consent is legally mandatory before use. |
| **Attendance anomaly detection (ATT-17)** | AI flags suspicious attendance patterns. | System | Catches subtle manipulation a human reviewer would miss. |
| **Roaming / field attendance (ATT-18)** | Multi-site check-ins for moving crews. | Employee, Manager | Cleaning and field teams don't sit at one branch; attendance must follow them. |
| **Kiosk / shared attendance mode (ATT-19)** | A fixed shared device as a check-in point. | Employee | Serves teams without personal phones, alongside the shared-device exception. |
| **Advanced spoofing defense (ATT-20)** | Hardened anti-spoofing using extra device signals. | System | As staff get cleverer at faking location, the defense has to level up. |

## 6. Tasks

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Task templates library (TSK-13)** | Reusable task/checklist templates. | Manager, Admin | Standardizes recurring operations and speeds up task creation. |
| **Bulk task assignment (TSK-14)** | Assigns to many people/branches at once. | Manager, Admin | Pushing the same checklist to 30 branches shouldn't take 30 actions. |
| **Natural-language task creation (TSK-15)** | Turns plain Arabic/English text into a structured task. | Manager | Lets a busy manager create tasks the way they'd text them. |
| **Smart task distribution (TSK-16)** | AI load-balances assignments. | System | Spreads work fairly instead of dumping it on whoever's top of the list. |
| **Recurring instance management (TSK-17)** | Skips or reschedules a single occurrence. | Manager | Handles one-off exceptions (a holiday, a closure) without breaking the series. |
| **Task calendar view (TSK-18)** | A calendar of tasks and deadlines. | Manager, Employee | A time-based view makes upcoming workload obvious. |
| **Task dependencies (TSK-19)** | Task B unlocks only after Task A. | Manager | Enforces order in multi-step processes where sequence matters. |

## 7. Proof of Work

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Video proof (PRF-10)** | Attaches short video evidence. | Employee | Some work (a running machine, a full walkthrough) can only be shown in motion. |
| **Signature capture (PRF-11)** | Captures an on-screen signature. | Employee | Supports sign-off workflows (client handover, delivery acceptance). |
| **Proof retention controls (PRF-12)** | Auto-expires proof per policy. | Owner, Admin | Storing sensitive evidence forever is a PDPL and cost liability. |

## 8. Approvals & Escalations

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Bulk approve (APR-09)** | Approves multiple items at once. | Manager | A manager with 40 pending items shouldn't tap through them one by one. |
| **Approval delegation (APR-10)** | Hands approval authority to another manager. | Manager, Admin | Keeps decisions flowing when the usual approver is away. |

## 9. Reports & Dashboards

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Scheduled/emailed reports (RPT-13)** | Auto-sends reports on a cadence. | Owner, Manager | The weekly summary should arrive on its own, no one pulling it manually. |
| **Adoption/usage analytics (RPT-14)** | Tracks DAU and usage vs. the WhatsApp fallback. | Owner | Measures whether the product is actually replacing the old chaos. |
| **Custom report builder (RPT-15)** | Builds ad-hoc reports. | Owner, Admin | Every business eventually wants a cut the standard reports don't offer. |
| **AI insights on reports (RPT-16)** | Explains the numbers in plain narrative. | Owner, Manager | Turns a chart into "here's what it means and where to look." |
| **Predictive analytics (RPT-17)** | Forecasts attendance/completion trends. | Owner | Shifts the owner from reacting to anticipating. |

## 10. Notifications & Alerts

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **SMS notifications (NOT-09)** | SMS channel for critical alerts. | Everyone | Reaches people even without the app open or data on. |
| **WhatsApp notifications (NOT-10)** | Reaches users on WhatsApp. | Everyone | Meets staff where they already are — and displaces their manual fallback. |
| **AI daily digest (NOT-11)** | Auto-summary of the day's operations. | Owner, Manager | The end-of-day brief that "reads the day" for the owner. |
| **Quiet hours / prayer-aware suppression (NOT-12)** | Holds non-urgent alerts during prayer/quiet times. | Owner, Admin | Respects local rhythm so the app isn't intrusive. |

## 11. Billing & Subscriptions

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **ZATCA e-invoicing (BIL-10)** | Issues compliant Fatoora e-invoices. | System, Billing Manager | A legal requirement for invoicing Saudi businesses — separate from payment collection. |
| **Upgrade/downgrade + proration (BIL-11)** | Handles plan changes with prorated billing. | Billing Manager | Customers grow and shrink; billing should adjust fairly and automatically. |
| **Coupons / discounts (BIL-12)** | Applies promo codes and discounts. | Billing Manager | A sales lever for onboarding and retention. |
| **Multi-currency (BIL-13)** | Bills in currencies beyond SAR. | Billing Manager | A hard requirement the moment expansion crosses the border. |
| **Usage-based add-ons (BIL-14)** | Charges for AI or extra usage. | Billing Manager | Monetizes heavier features without inflating the base price for everyone. |

## 12. AI Layer

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **AI assistant (AI-01)** | Answers natural-language questions about the day ("who's late today?"). | Owner, Manager | The assistant that "reads the day for me" and points straight at the problem. |
| **Auto daily summary (AI-02)** | Generates an end-of-day operations brief. | Owner, Manager | The owner gets the story of the day without assembling it themselves. |
| **Natural-language task creation (AI-03)** | Turns plain text into a structured task. | Manager | Removes the friction of forms for quick task creation. |
| **Smart task distribution (AI-04)** | Auto-assigns work in a balanced way. | System | Fair, fast assignment without manual load-balancing. |
| **Attendance anomaly detection (AI-05)** | Spots manipulation and odd patterns. | System | Surfaces integrity issues the owner would never catch by eye. |
| **Early-warning signals (AI-06)** | Flags slipping branches and chronic lateness before they become crises. | Owner, Manager | The core "warn me before small problems get expensive" promise. |
| **AI configuration & toggle (AI-07)** | Enables and tunes AI per company. | Owner, Admin | Companies must control whether and how AI runs on their data. |
| **Arabic NLP (AI-08)** | Understands Arabic input reliably. | System | AI in KSA is worthless if it can't handle Arabic properly. |
| **Predictive staffing (AI-09)** | Forecasts staffing needs. | Owner, Manager | Plans the roster around predicted demand, not guesswork. |

## 13. Audit & Logging

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Audit export (AUD-06)** | Exports audit logs for review/compliance. | Auditor | Compliance reviews and disputes need the log outside the app. |
| **Data-access logs (AUD-07)** | Records who accessed sensitive data. | Auditor | PDPL cares not just about changes, but about who *looked*. |
| **Tamper-evidence (AUD-08)** | Adds cryptographic integrity to logs. | System | Makes the audit trail defensible even against a determined insider. |

## 14. Localization & Compliance

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Biometric template storage (LOC-11)** | Stores verification templates, not raw face images. | System | Minimizes biometric risk under PDPL — you can't leak a face you never stored. |
| **Data-subject requests (LOC-12)** | Handles right-to-access and right-to-delete. | Owner, Admin | PDPL gives individuals these rights; the system must be able to honor them. |
| **Multi-language framework (LOC-13)** | Extensible i18n beyond Arabic/English. | System | The foundation for adding new-market languages during expansion. |
| **Broader Gulf/MENA localization (LOC-14)** | Local calendars, weekends, and rules per market. | Owner, Admin | Each new country has its own week, calendar, and labor rules. |

## 15. Platform & Apps

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Public API / webhooks (APP-08)** | Programmatic access and event hooks. | Admin | Lets customers connect Ara Tasks to their own systems. |
| **QR / deep-link onboarding (APP-09)** | Fast join via QR code or link. | Employee | Cuts onboarding friction for large frontline teams. |
| **Accessibility (APP-10)** | A WCAG-aligned accessible UI. | Everyone | Broadens who can use the product and meets accessibility expectations. |
| **Payroll / HR integrations (APP-11)** | Connects to payroll and export formats. | Admin, Payroll Viewer | Attendance data is most valuable when it flows straight into payroll. |
| **White-label / branding (APP-12)** | Company logo and theme inside the app. | Owner, Admin | Lets larger clients present the tool under their own brand. |

## 16. Settings

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Security settings (SET-06)** | 2FA policy and device policy. | Owner, Admin | Gives companies control over their own security posture. |
| **Feature toggles (SET-07)** | Turns face verification / AI on per company. | Owner, Admin | Sensitive and advanced features must be opt-in, company by company. |
| **Data & privacy settings (SET-08)** | Retention windows, consent, and deletion. | Owner, Admin | The single place to govern PDPL obligations. |
| **Integration settings (SET-09)** | Configures external connectors. | Admin | Manages the credentials and options for third-party links. |

## 17. Platform / Operator Console — *Operator Plane*

| Feature (ID) | What it does | Who uses it | Why it exists |
|---|---|---|---|
| **Platform audit export (PLT-19)** | Exports platform audit logs for compliance review. | Super Admin, Auditor | Regulators and enterprise customers will ask for proof of who accessed what. |
| **Cross-tenant usage & health analytics (PLT-20)** | Scores adoption and health across all customers. | Super Admin, Ops | Spotting a churning or thriving account early is how the operator grows and retains revenue. |
| **Guided onboarding workflow (PLT-21)** | A step-by-step checklist for onboarding a new customer. | Ops | Faster, more consistent activation means customers reach value before the trial ends. |
| **Hardened impersonation controls (PLT-22)** | Granular, scoped, least-privilege impersonation. | Super Admin | As the customer base grows, break-glass access must get tighter, not looser. |
| **Reseller / partner management (PLT-23)** | Lets partners resell Ara Tasks under a multi-level operator model. | Super Admin | Expansion often runs through local partners who need their own slice of the platform. |
| **White-label operator portals (PLT-24)** | Branded operator portals per reseller. | Super Admin | Partners want to present the platform under their own brand as the business scales. |

---
---

# How to Use This Catalog

- **Scoping:** the "Why it exists" column is your cut test — if a feature's why doesn't tie to a real owner pain, question whether it belongs in the phase.
- **Backlog:** each row becomes an epic; the "What it does" seeds the user stories, the "Why" seeds the acceptance rationale.
- **Sales/onboarding:** the "Who uses it" and "Why" columns are ready-made talking points per role.

*Next in the chain: convert these features into a prioritized backlog (epics → user stories), then an SRS with acceptance criteria per feature.*
