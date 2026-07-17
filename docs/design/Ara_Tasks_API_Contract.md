# Ara Tasks — API Contract

**Purpose:** Define the HTTP API — endpoints per module, request/response shapes, required permissions, and error codes — built on the *Database Design* and enforcing the *Business Logic* rules and *Roles & Permissions* scopes. This is the contract the mobile app, web dashboard, and operator console all build against.

**Style:** REST + JSON, OpenAPI-describable, per *System Design* (NestJS). Real-time deltas go over the WebSocket channel (§15).

---

## 1. Conventions

- **Base URLs:** tenant plane → `/api/v1` · operator plane → `/operator/v1` (separate service + token audience).
- **Auth:** `Authorization: Bearer <access_token>`. **Tenant context is derived from the token**, never from the URL — there is no `/tenants/{id}/…` in the tenant plane.
- **Every request** passes the auth guard, then the **RBAC + scope guard**. The permission each endpoint needs is listed in its table. Missing permission/scope → `403`.
- **Content type:** `application/json` (except media, which goes to object storage via signed URLs).
- **Localization:** `Accept-Language: ar | en`.
- **Idempotency:** writes that back offline capture accept `Idempotency-Key: <uuid>` and are safe to retry (check-in, check-out, submit, proof register, sync).
- **Pagination (lists):** cursor-based → `?limit=50&cursor=<opaque>`; response includes `meta.next_cursor` (null at end).
- **Timestamps:** ISO-8601 UTC (`2026-07-17T09:05:00Z`). **IDs:** UUID.
- **Versioning:** URL (`/v1`).

### 1.1 Response envelopes
- **Single resource:** the object directly → `{ "id": "...", ... }`.
- **List:** `{ "data": [ ... ], "meta": { "next_cursor": "..." | null } }`.
- **Error:** `{ "error": { "code": "GEOFENCE_FAILED", "message": "...", "details": { ... } } }`.

### 1.2 Status codes
`200` OK · `201` Created · `204` No Content · `400` validation · `401` unauthenticated · `403` forbidden (permission/scope) · `404` not found · `409` conflict (already decided / already checked-in) · `422` business-rule violation · `429` rate-limited.

### 1.3 Canonical error codes
| Code | HTTP | Meaning | Rule |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Bad input | — |
| `UNAUTHENTICATED` | 401 | Missing/expired token | — |
| `FORBIDDEN` | 403 | Lacks permission in scope | `BR-R-01` |
| `CONSENT_REQUIRED` | 422 | No location consent on record | `BR-C-01` |
| `DEVICE_NOT_BOUND` | 422 | Check-in from unbound device | `BR-A-01`, `ATT-04` |
| `GEOFENCE_FAILED` | 422 | Outside branch geofence | `ATT-03` |
| `MOCK_LOCATION` | 422 | Fake location detected | `ATT-14` |
| `SESSION_ALREADY_OPEN` | 409 | Already checked in | `BR-A-07` |
| `PROOF_REQUIRED` | 422 | Missing required proof on submit | `BR-T-02`, `PRF-08` |
| `NOT_ON_SITE` | 422 | Location-bound task off-site | `TSK-11` |
| `ALREADY_DECIDED` | 409 | Item already approved/rejected | `BR-D-04` |
| `SELF_DECISION` | 403 | Cannot decide own submission | `BR-D-05` |
| `REASON_REQUIRED` | 422 | Rejection without reason | `BR-D-02` |
| `ACCOUNT_SUSPENDED` | 403 | Tenant suspended | `BR-B-01` |

---
---

## 2. Auth & Identity — `/auth`, `/me`, `/devices`

| Method Path | Permission | Description |
|---|---|---|
| `POST /auth/login` | public | Phone/email + password |
| `POST /auth/otp/request` | public | Request SMS OTP |
| `POST /auth/otp/verify` | public | Verify OTP → tokens |
| `POST /auth/refresh` | public | Rotate refresh → new access |
| `POST /auth/logout` | auth | Revoke refresh + device token |
| `POST /auth/password/forgot` | public | Start reset |
| `POST /auth/password/reset` | public | Complete reset |
| `POST /auth/consent` | auth | Record PDPL consent (location/biometric) |
| `GET /me` | auth | Current user + effective permissions |
| `PATCH /me` | auth (self) | Edit own profile (limited) |
| `POST /devices/register` | auth | Bind this device |
| `POST /devices/rebind/request` | auth | Request device change |
| `POST /devices/{id}/rebind/approve` | `user:update` | Approve a re-bind |

**`POST /auth/login`**
```json
// request
{ "identifier": "+9665XXXXXXXX", "password": "••••••••", "device_fingerprint": "d3v1c3-h4sh" }
// 200
{ "access_token": "jwt...", "refresh_token": "jwt...", "expires_in": 900,
  "user": { "id": "u_…", "full_name": "…", "locale": "ar" },
  "device_status": "bound" }
```

**`POST /auth/otp/verify`** → same token payload as login. `device_status` may be `pending_rebind` if a new device.

**`GET /me`** — the client uses this to render UI by permission.
```json
{ "id": "u_…", "tenant_id": "t_…", "full_name": "…", "job_title": "…",
  "branch_id": "b_…", "roles": ["Manager"],
  "permissions": [ { "key": "task:approve", "scopes": [ { "type": "branch", "id": "b_…" } ] },
                   { "key": "attendance:approve", "scopes": [ { "type": "branch", "id": "b_…" } ] } ],
  "consents": { "location": true } }
```

**`POST /auth/consent`**
```json
{ "type": "location", "granted": true, "policy_version": "pdpl-2026-01" } // 204
```

**`POST /devices/register`**
```json
{ "fingerprint": "d3v1c3-h4sh", "platform": "ios", "push_token": "fcm:…" }
// 201 → { "id": "dev_…", "status": "bound" }   or   { "status": "pending_rebind" } if one already bound
```

---
---

## 3. Organization — `/branches`, `/departments`, `/teams`, `/org`

| Method Path | Permission | Description |
|---|---|---|
| `GET /branches` | `branch:manage` \| `*:view` in scope | List branches |
| `POST /branches` | `branch:manage` | Create branch (+geofence) |
| `GET/PATCH/DELETE /branches/{id}` | `branch:manage` | Read/update/archive |
| `GET/POST /departments` | `department:manage` | List/create |
| `POST /departments/{id}/branches` | `department:manage` | Set cross-branch coverage |
| `GET/POST /teams` | `team:manage` | List/create |
| `POST /org/reporting` | `user:update` | Add manager edge |
| `PATCH /org/reporting/{id}` | `user:update` | Set `is_primary` |
| `DELETE /org/reporting/{id}` | `user:update` | Remove edge |
| `GET /org/chart` *(P2)* | `user:view` | Hierarchy view |

**`POST /branches`** — geofence as center+radius (or polygon).
```json
{ "name": "Olaya Branch", "code": "OLY",
  "center": { "lat": 24.6911, "lng": 46.6857 }, "radius_m": 150,
  "timezone": "Asia/Riyadh",
  "working_hours": { "sun_thu": ["08:00","17:00"] } }
// 201 → branch object
```

**`POST /org/reporting`**
```json
{ "subordinate_user_id": "u_a", "manager_user_id": "u_b", "is_primary": true } // 201
```

---
---

## 4. Users & Invitations — `/users`, `/invitations`

| Method Path | Permission | Description |
|---|---|---|
| `GET /users` | `user:view` (scoped) | List/filter users in scope |
| `POST /users` | `user:create` | Create user |
| `GET/PATCH/DELETE /users/{id}` | `user:view`/`user:update`/`user:delete` | Manage a user |
| `POST /users/{id}/assignment` | `user:update` | Set branch/dept/team + managers |
| `POST /invitations` | `user:invite` | Invite (link/SMS) |
| `POST /invitations/{token}/accept` | public | Accept invite |
| `POST /users/import` *(P2)* | `user:create` | Bulk CSV import |

**`GET /users?branch_id=&status=&q=`** → paginated list scoped to the caller.

---
---

## 5. Roles & Permissions — `/roles`, `/permissions`, `/role-assignments`

| Method Path | Permission | Description |
|---|---|---|
| `GET /permissions` | `role:view` | The permission registry |
| `GET /roles` | `role:view` | List roles (default + custom) |
| `POST /roles` | `role:create` | Create custom role |
| `GET/PATCH/DELETE /roles/{id}` | `role:view`/`role:update` | Manage role |
| `PUT /roles/{id}/permissions` | `role:update` | Set role's permissions |
| `POST /role-assignments` | `role:assign` | Grant a role to a user at a scope |
| `DELETE /role-assignments/{id}` | `role:assign` | Revoke |
| `GET /users/{id}/permissions` | `role:view` | Effective permissions (union) |

**`POST /role-assignments`** — the scoped grant.
```json
{ "user_id": "u_a", "role_id": "r_manager", "scope_type": "branch", "scope_id": "b_oly" } // 201
```

**`POST /roles`**
```json
{ "name": "Shift Lead",
  "permissions": ["attendance:view","attendance:approve","task:view","task:approve","task:reject"] } // 201
```

---
---

## 6. Shifts — `/shifts`, `/shift-assignments`, `/holidays`

| Method Path | Permission | Description |
|---|---|---|
| `GET/POST /shifts` | `shift:manage` | List/create shifts |
| `GET/PATCH/DELETE /shifts/{id}` | `shift:manage` | Manage shift |
| `POST /shift-assignments` | `shift:manage` | Assign shift to user/team (+pattern) |
| `GET /shift-assignments?user_id=&from=&to=` | `shift:manage`\|`*:view` | Schedule/calendar |
| `GET/POST /holidays` | `shift:manage` | Manage holidays |

**`POST /shift-assignments`**
```json
{ "shift_id": "s_morning", "assignee_type": "team", "assignee_id": "team_1",
  "pattern_id": "p_weekly", "effective_from": "2026-08-01" } // 201
```

---
---

## 7. Attendance — `/attendance` *(the hot path)*

| Method Path | Permission | Description |
|---|---|---|
| `POST /attendance/check-in` | active user (self) | Check in (geofence + device + mock) |
| `POST /attendance/check-out` | active user (self) | Check out |
| `GET /attendance/sessions?user_id=&from=&to=` | `attendance:view` (scoped)\|self | Timeline |
| `GET /attendance/live?branch_id=` | `attendance:view` | Who's in now |
| `POST /attendance/corrections` | `attendance:correct` (self) | Request correction |
| `POST /attendance/corrections/{id}/decision` | `attendance:approve` (scoped) | Approve/reject |
| `POST /attendance/sync` | active user (self) | Offline batch replay |

**`POST /attendance/check-in`** — validated per `BR-A-01`.
```json
// request  (Idempotency-Key header recommended)
{ "branch_id": "b_oly",
  "location": { "lat": 24.6912, "lng": 46.6858, "accuracy_m": 8 },
  "device_fingerprint": "d3v1c3-h4sh",
  "captured_at": "2026-07-17T08:03:00Z",
  "is_mock_location": false }

// 201 success
{ "session_id": "att_…", "state": "open",
  "flags": { "late": true, "lateness_minutes": 3 } }

// 422 failures (one of):
{ "error": { "code": "CONSENT_REQUIRED" } }
{ "error": { "code": "DEVICE_NOT_BOUND" } }
{ "error": { "code": "GEOFENCE_FAILED", "details": { "distance_m": 320, "radius_m": 150 } } }
{ "error": { "code": "MOCK_LOCATION" } }
// 409
{ "error": { "code": "SESSION_ALREADY_OPEN", "details": { "session_id": "att_…" } } }
```

**`POST /attendance/check-out`**
```json
{ "session_id": "att_…", "location": { "lat": …, "lng": … }, "captured_at": "…" }
// 200 → { "state": "closed", "flags": { "early_departure": false } }
```

**`GET /attendance/live?branch_id=b_oly`**
```json
{ "data": [ { "user_id": "u_a", "full_name": "…", "check_in_at": "…", "late": true } ],
  "meta": { "present": 12, "expected": 15, "absent": 3 } }
```

**`POST /attendance/corrections`**
```json
{ "session_id": "att_…", "reason": "GPS drift, was on-site",
  "requested_change": { "check_in_at": "2026-07-17T08:00:00Z" } } // 201 (state: pending)
```

**`POST /attendance/corrections/{id}/decision`**
```json
{ "decision": "approved" }                          // 200
{ "decision": "rejected", "reason": "No supporting proof" }  // 200
// 409 ALREADY_DECIDED · 403 SELF_DECISION
```

**`POST /attendance/sync`** — offline replay; server re-validates and flags conflicts (`BR-A-08`, `BR-X-01`).
```json
{ "events": [
    { "type": "check_in", "idempotency_key": "k1", "branch_id": "b_oly", "location": {…}, "captured_at": "…" },
    { "type": "check_out", "idempotency_key": "k2", "session_ref": "k1", "captured_at": "…" }
] }
// 200 → per-event result
{ "results": [ { "idempotency_key": "k1", "status": "accepted", "session_id": "att_…" },
               { "idempotency_key": "k2", "status": "conflict", "code": "GEOFENCE_FAILED" } ] }
```

---
---

## 8. Tasks — `/tasks`, `/task-series`

| Method Path | Permission | Description |
|---|---|---|
| `GET /tasks?assignee=&state=&overdue=` | `task:view` (scoped)\|self | List tasks |
| `POST /tasks` | `task:create` | Create task |
| `GET/PATCH /tasks/{id}` | `task:view`/`task:create` | Read/edit |
| `POST /tasks/{id}/start` | self (assignee) | → in_progress |
| `PATCH /tasks/{id}/checklist/{itemId}` | self (assignee) | Tick checklist item |
| `POST /tasks/{id}/submit` | self (assignee) | → submitted (proof gate) |
| `POST /tasks/{id}/reassign` | `task:reassign` | Change assignee |
| `POST /tasks/{id}/cancel` | `task:create` | → cancelled |
| `GET/POST /tasks/{id}/comments` | `task:view` | Thread |
| `GET/POST /task-series` | `task:create` | Recurring definitions |

**`POST /tasks`**
```json
{ "title": "Morning fridge temp check", "description": "…",
  "priority": "high", "deadline_at": "2026-07-17T10:00:00Z",
  "assignee_user_id": "u_a", "location_bound": true,
  "required_proof": { "photo": 1 },
  "checklist": [ { "text": "Photo of thermometer", "is_required": true } ] } // 201
```

**`POST /tasks/{id}/submit`** — enforces `BR-T-02`.
```json
{ "proof_ids": ["prf_1"], "location": { "lat": …, "lng": … } }
// 200 → { "state": "submitted" }
// 422 PROOF_REQUIRED · 422 NOT_ON_SITE
```

---
---

## 9. Proof — `/proofs`

| Method Path | Permission | Description |
|---|---|---|
| `POST /proofs/upload-url` | `proof:submit` | Get pre-signed PUT URL |
| `POST /proofs` | `proof:submit` | Register proof metadata |
| `GET /tasks/{id}/proofs` | `proof:view`\|self | Proof gallery |
| `GET /proofs/{id}/url` | `proof:view`\|self | Short-lived signed GET |

**Flow (`BR-P-01`, direct-to-storage):**
```json
// 1) POST /proofs/upload-url
{ "task_id": "t_…", "type": "photo", "content_type": "image/jpeg" }
// 200
{ "upload_url": "https://…signed-PUT…", "storage_key": "tenant/…/prf_1.jpg", "expires_in": 300 }

// 2) client PUTs the image directly to upload_url (live camera only)

// 3) POST /proofs  (register metadata)
{ "task_id": "t_…", "type": "photo", "storage_key": "tenant/…/prf_1.jpg",
  "captured_at": "…", "location": { "lat": …, "lng": … } }
// 201 → { "id": "prf_1" }
```

---
---

## 10. Approvals & Escalation — `/approvals`, task decisions

| Method Path | Permission | Description |
|---|---|---|
| `GET /approvals/inbox?type=&scope=` | `task:approve`\|`attendance:approve` | Pending decisions in scope |
| `POST /tasks/{id}/decision` | `task:approve`/`task:reject` (scoped) | Approve/reject work |
| `GET /escalations?state=` | `task:approve` | Escalation status |

**`POST /tasks/{id}/decision`** — `BR-D-*`, first-decision-wins.
```json
{ "decision": "approved" }                              // 200 → { "state": "approved" }
{ "decision": "rejected", "reason": "Photo too blurry" } // 200 → { "state": "reopened" }
// 409 ALREADY_DECIDED · 403 SELF_DECISION · 422 REASON_REQUIRED
```

---
---

## 11. Notifications — `/notifications`

| Method Path | Permission | Description |
|---|---|---|
| `GET /notifications?unread=true` | auth (self) | Feed |
| `POST /notifications/{id}/read` | auth (self) | Mark read |
| `POST /notifications/read-all` | auth (self) | Mark all read |
| `GET/PATCH /notification-preferences` | auth (self) | Channel prefs (`BR-N-16`) |

---
---

## 12. Reports & Dashboards — `/dashboards`, `/reports`, `/exports`

| Method Path | Permission | Description |
|---|---|---|
| `GET /dashboards/owner` | `report:view` (company) | Company-wide KPIs |
| `GET /dashboards/manager?scope=` | `report:view` (scoped) | Team/branch KPIs |
| `GET /dashboards/me` | auth (self) | My day |
| `GET /reports/attendance?from=&to=&branch_id=` | `report:view` | Lateness/absence |
| `GET /reports/tasks?from=&to=` | `report:view` | Completion, on-time %, proof % |
| `GET /reports/branches` | `report:view` (company) | Branch comparison |
| `POST /exports` | `report:export` | Generate PDF/XLSX/CSV |
| `GET /exports/{id}` | `report:export` | Poll → signed download URL |

**`GET /dashboards/owner`** (shape)
```json
{ "present_now": 128, "expected_now": 150,
  "on_time_rate": 0.91, "proof_coverage": 0.87, "open_tasks": 342, "overdue_tasks": 12,
  "branches": [ { "id": "b_oly", "name": "Olaya", "on_time_rate": 0.95, "proof_coverage": 0.9 } ] }
```

---
---

## 13. Billing — `/billing`

| Method Path | Permission | Description |
|---|---|---|
| `GET /billing/subscription` | `billing:view` | Current plan/status/seats |
| `GET /billing/plans` | `billing:view` | Plans available to tenant |
| `GET /billing/invoices` | `billing:view` | Invoices |
| `GET /billing/invoices/{id}` | `billing:view` | One invoice (+PDF) |
| `POST /billing/checkout` | `billing:manage` | Init MyFatoorah payment |
| `POST /billing/webhooks/myfatoorah` | **public + signature-verified** | Payment callback |

**`POST /billing/checkout`**
```json
{ "plan_id": "plan_pro", "seats": 25 }
// 200 → { "payment_url": "https://myfatoorah…", "invoice_id": "inv_…" }
```
> Webhook verifies provider signature, then transitions account state (`BR-B-01`) and emits `AccountStateChanged`.

---
---

## 14. Settings & Audit — `/settings`, `/feature-toggles`, `/audit`

| Method Path | Permission | Description |
|---|---|---|
| `GET /settings` | `settings:view` | All settings |
| `PATCH /settings` | `settings:update` | Update settings/policies |
| `GET/PATCH /feature-toggles` | `settings:update` | Toggle face/AI (`SET-07`) |
| `GET /audit?resource=&actor=&from=&to=` | `audit:view` | Audit trail (scoped) |
| `GET /audit/export` *(P2)* | `audit:view` | Export logs |

---
---

## 15. Real-time — WebSocket

- **Connect:** `wss://…/ws?token=<access_token>` (same auth; tenant/scope derived from token).
- **Subscribe** to channels the user is permitted to see:
  - `notifications` → live notification objects.
  - `attendance:live:{branch_id}` → presence deltas (`ATT-12`), needs `attendance:view` in scope.
  - `approvals:inbox` → new/removed pending items (`APR-07`).
- **Event payload:**
```json
{ "channel": "approvals:inbox", "event": "item.added",
  "data": { "task_id": "t_…", "title": "…", "priority": "high", "submitted_at": "…" } }
```
- Scaling: Socket.IO + Redis adapter (per *System Design*).

---
---

## 16. Operator Plane — `/operator/v1` *(separate service, separate auth)*

Operator tokens (`audience=operator`, 2FA required) are meaningless on the tenant API and vice-versa (`BR-R-05`).

| Method Path | Permission | Description |
|---|---|---|
| `POST /operator/auth/login` | public + 2FA | Operator login |
| `GET /operator/tenants` | `tenant:view` | Tenant directory (metadata only) |
| `POST /operator/tenants` | `tenant:provision` | Provision + assign region |
| `POST /operator/tenants/{id}/suspend` | `tenant:lifecycle` | Suspend |
| `POST /operator/tenants/{id}/reactivate` | `tenant:lifecycle` | Reactivate |
| `POST /operator/tenants/{id}/offboard` | `tenant:offboard` | Terminate + delete workflow |
| `POST /operator/tenants/{id}/impersonate` | `tenant:impersonate` | Break-glass session |
| `GET/POST /operator/plans` | `plan:manage` | Plans + entitlements |
| `GET/PATCH /operator/feature-flags` | `feature_flag:manage` | Flags (global/per-tenant) |
| `GET /operator/billing` | `platform_billing:view` | Cross-tenant billing |
| `GET/POST /operator/staff` | `platform_user:manage` | Internal staff |
| `GET /operator/audit` | `platform_audit:view` | Platform audit trail |

**`POST /operator/tenants/{id}/impersonate`** — the most sensitive call (`BR-O-02/03`).
```json
// request
{ "reason": "Ticket #4821 – employee can't check in", "read_only": true, "ttl_minutes": 30,
  "consent_ref": "consent_…"  /* required unless contractually authorized */ }
// 201
{ "impersonation_token": "jwt(scoped, read_only, exp=30m)…", "expires_at": "…",
  "audit": { "platform_log_id": "…", "tenant_log_id": "…" } }
```
> Opens a time-boxed, read-only-by-default session; writes to **both** audit trails and shows a live banner inside the tenant. Auto-expires.

---

## 17. What's MVP vs Later

- **MVP:** everything above except `*(P2)*`-tagged endpoints (bulk import, org chart, audit export, scheduled reports), face-verification, and ZATCA fields.
- **Phase 2:** AI endpoints (`/ai/assistant`, `/ai/digest`), SMS/WhatsApp channels, face-verification enrollment, ZATCA invoice fields, scheduled reports.
- **Phase 3:** public API keys + webhooks for tenants (`APP-08`), reseller endpoints.

---

*Next in the chain: a **prioritized backlog** (epics → user stories) that implements these endpoints sprint by sprint, each story citing the tables (Database Design) and rules (Business Logic) it must satisfy.*
