# ARA Tasks — Security Design

**Purpose:** Consolidate every security control into one authoritative design — authentication, tokens, RBAC, rate limiting, input validation, file/media protection, tenant isolation, data protection (PDPL), secrets, and monitoring. It builds on *System Design*, *System Architecture*, *Business Logic*, and *Tech Stack Finalization*, and adds the implementation-level rules a developer follows.

**Threat model in one line:** a multi-tenant SaaS holding **employee location + identity data**, where the core risks are *cross-tenant leakage, attendance-integrity fraud (faking presence), privilege escalation, media/PII exposure, and operator over-reach.* Every control below maps to one of these.

**Security principles:**
1. **Defense in depth** — no single control is the only thing standing between an attacker and data.
2. **Deny by default** — access is denied unless a matching, scoped permission grants it.
3. **Server is the only boundary** — clients are never trusted; UI enforcement is cosmetic.
4. **Least privilege** — users, operators, and service accounts get the minimum they need.
5. **Everything sensitive is logged, immutably.**

---
---

## 1. Authentication

### 1.1 Login methods
- **Phone/email + password**, and **OTP-SMS** (KSA phone-first).
- **Passwords hashed with argon2id** (memory-hard), never reversible; a global pepper stored in the secret manager, plus per-hash salt (argon2 built-in).
- **Password policy:** min length + breached-password rejection; no forced rotation (rotation harms security); lockout/backoff on repeated failures.

### 1.2 OTP
- 6-digit, **hashed at rest**, single-use, **short TTL (≤ 5 min)**, **max attempts (≤ 5)** then invalidate, rate-limited per phone + per IP (§4). Codes never logged.

### 1.3 Two identity spaces (hard rule)
Tenant users and platform operators are **separate**: separate tables, separate login, separate token **audience** (`tenant` vs `operator`). A token minted for one plane is rejected by the other (`aud` claim check). **Operators require mandatory 2FA/SSO.**

### 1.4 Two-factor (TOTP)
- **Mandatory for operators**; recommended for tenant Owner/Admin (Phase 2).
- **otplib** TOTP; secret stored encrypted; recovery codes hashed and single-use.

### 1.5 Consent gate (PDPL)
No location is captured or stored until **recorded consent** exists for that user. Login/onboarding routes through the consent gate; missing consent blocks check-in (`BR-C-01`).

---
---

## 2. Tokens (JWT + refresh)

### 2.1 Access token (JWT)
- **Signed with jose**, algorithm **EdDSA** (or RS256) via an asymmetric key pair — private key in the secret manager, public key for verification.
- **Short-lived: 10–15 min.**
- **Claims (minimal):** `sub` (user_id), `tid` (tenant_id), `aud` (`tenant`|`operator`), `sid` (session), `iat/exp/jti`. **No permissions baked in** — they are resolved per request (§3.4) so revocation/edits are instant.
- **Transport:** `Authorization: Bearer …`. On web, prefer an **httpOnly, Secure, SameSite=Strict cookie** for the refresh token; the access token lives in memory (not localStorage) to reduce XSS theft.

### 2.2 Refresh token
- **Opaque, high-entropy, stored server-side hashed** (never a self-contained JWT you can't revoke).
- **Rotating:** each use issues a new refresh token and invalidates the old one.
- **Reuse detection:** if a already-rotated token is presented → treat as theft → **revoke the whole session family** and force re-auth.
- **Bound to the device** (device fingerprint) and revocable individually or per-user (logout-all).
- **Lifetime:** sliding, e.g. 30 days idle max; absolute cap enforced.

### 2.3 Session & logout
- Sessions are server-tracked (Redis + DB) so **logout, password change, role change, and suspension revoke instantly**.
- Password change / suspension → revoke all sessions.

### 2.4 Key management
- **Signing keys rotated** on a schedule; support **key IDs (`kid`)** so old tokens verify during rotation windows. Keys never leave the secret manager.

---
---

## 3. Authorization (RBAC + scope)

### 3.1 Model
`resource:action` permissions, evaluated at a **scope** (company / branch / department / team / self) — from *Roles & Permissions* and *Business Logic* (`BR-R-*`).

### 3.2 Enforcement (server-side, every request)
Each request passes two guards:
1. **AuthGuard** — valid token → `{user_id, tenant_id, audience}`; sets `app.tenant_id` for RLS.
2. **PermissionGuard** — does the user hold the required `resource:action` **within the target's scope**? Deny by default.

```ts
// NestJS guard sketch — declared per route
@RequirePermission('task:approve', ScopeOf('task'))   // scope resolved from the task's branch/dept/team
@Post('tasks/:id/decision')
decide(...) { /* only runs if guard passed */ }
```

### 3.3 Scope resolution
The scope engine resolves the target's owning branch/department/team and checks the user holds the permission at that scope or an **ancestor** (company ⊃ branch ⊃ department ⊃ team ⊃ self). No permission applies outside its scope.

### 3.4 Instant, cached resolution
Effective permissions = **union of all role assignments**, resolved per request and **cached in Redis** keyed by `user_id`; the cache is **invalidated on any role/assignment change** so edits and revocations take effect immediately.

### 3.5 Invariant guards (cannot be configured away)
- **No self-decision** (`BR-D-05`) — enforced in the domain layer, not just UI.
- **First-decision-wins** (`BR-D-04`) — DB-level state guard (`UPDATE … WHERE state='submitted'`) prevents double decisions under concurrency.
- **Plane isolation** — a tenant token can never carry a platform permission and vice-versa.

### 3.6 Object-level checks
Beyond route permissions, every read/write re-checks the **object belongs to the caller's tenant and scope** (defense against IDOR — guessing another tenant's UUID returns 404, not 403, to avoid confirming existence).

---
---

## 4. Rate Limiting & Abuse Protection

Applied at the edge (gateway/WAF) **and** in-app (Redis counters). Limits are per-identity where possible, per-IP as fallback.

| Surface | Limit (indicative, tune in prod) | Response |
|---|---|---|
| Login / password | 5 / 15 min per identity + per IP | 429 + backoff, temporary lockout |
| OTP request | 3 / 10 min per phone; 10 / hr per IP | 429 |
| OTP verify | 5 attempts per code | invalidate code |
| Token refresh | tight per session | 429 + reuse-detection |
| Check-in | small burst per user (idempotent) | 429 / dedupe |
| General API | per-token quota (e.g. 100/min) | 429 with `Retry-After` |
| Media upload URL | per user quota | 429 |
| Public webhooks | per source + signature | reject unsigned |

- **Global protections:** WAF (OWASP rules), bot/DDoS mitigation at the CDN, connection limits.
- **Account enumeration:** login/OTP/reset return **uniform responses** whether or not the identity exists.
- **Exponential backoff + lockout** on repeated auth failures.

---
---

## 5. Input Validation & Injection Defense

- **Validate everything at the boundary with Zod** — the **same schemas shared** between the web client and the NestJS API (`@ara/types`). Reject on the server regardless of client validation.
- **Allow-list, not deny-list:** define exactly what's permitted (types, ranges, enums, lengths, formats). Unknown fields stripped.
- **SQL injection:** **parameterized queries only** (Drizzle) — never string-concatenated SQL; RLS as a further backstop.
- **XSS:** React/Flutter escape by default; **never** `dangerouslySetInnerHTML` with user data; sanitize any rich text; strict **Content-Security-Policy**, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **SSRF:** no server-side fetching of user-supplied URLs; if ever needed, allow-list hosts and block internal ranges.
- **Mass assignment:** DTOs whitelist writable fields; server ignores client-set `id`, `tenant_id`, `role`, timestamps.
- **Deserialization / file parsing:** validate content types and sizes before processing.

---
---

## 6. File & Media Protection (proof, exports, documents)

Proof media is sensitive (photos of workplaces, sometimes people) — treated as PII.

- **Never public.** No object is world-readable; the bucket blocks public access.
- **Upload:** device gets a **short-lived pre-signed PUT URL** scoped to one object key with an enforced **content-type + max size**; server records metadata after the object exists.
- **Download:** short-lived **pre-signed GET URLs** only, issued after a `proof:view`/self scope check — never a stable link.
- **Validation:** verify MIME/type + size server-side; strip or ignore risky metadata; re-derive dimensions server-side (don't trust client).
- **Live-camera enforcement:** proof capture forces the live camera (gallery disabled) client-side; server records capture context (`PRF-09`).
- **Encryption:** SSE at rest + TLS in transit.
- **Retention:** storage **lifecycle rules** + purge jobs enforce PDPL retention; deletion is logged (`BR-C-02`).
- **Path/tenant scoping:** object keys are namespaced by tenant; access checks tie the object to the caller's tenant/scope.

---
---

## 7. Tenant Isolation

The #1 risk in multi-tenant SaaS. Defense in depth:
1. **App scope engine** — every query is tenant-scoped by the resolved `tenant_id`.
2. **PostgreSQL Row-Level Security** — `USING (tenant_id = current_setting('app.tenant_id'))` on tenant tables; even a query bug cannot cross tenants.
3. **`tenant_id` set from the token**, per request/transaction — never from client input.
4. **IDOR defense** — object access re-verified against tenant + scope; cross-tenant IDs 404.
5. **Media keys** namespaced per tenant; signed URLs scoped.
6. **Residency** — a tenant's data (and bucket) live in its assigned region.
7. **Large-tenant option** — dedicated DB/cluster later without app changes.

---
---

## 8. Attendance-Integrity Controls (domain-specific)

Faking presence is the product's signature fraud risk. Layered:
- **Geofence** (PostGIS point-in-zone) — must be inside the branch.
- **Device binding** — check-in only from the bound device; re-bind needs approval.
- **Mock-location detection** — flag/block spoofed GPS.
- **Server-side validation** — all checks re-run on the server; offline captures are **re-validated on sync** and conflicts flagged, never auto-trusted (`BR-A-08`, `BR-X-01`).
- **Face verification (Phase 2)** — optional, consented, **templates not images**, opt-out.
- Any single hard-signal failure blocks the check-in (`BR-V-04`).

---
---

## 9. Operator Plane Security (privileged access)

The highest-blast-radius surface.
- **Separate service + identity space + mandatory 2FA.**
- **No default access to tenant content** — operators manage accounts, not data.
- **Break-glass (`tenant:impersonate`)** is the only path into tenant data and is: **consented (or contractually authorized), time-boxed, read-only by default, least-privilege, and dual-audited** (platform + tenant logs) with a **live in-tenant banner** (`BR-O-02/03`).
- **Destructive ops** (`tenant:offboard`, data deletion) are Super-Admin-only with explicit confirmation.
- **Infra access** (DB/servers/backups) is governed by cloud IAM — separate from and tighter than app RBAC.

---
---

## 10. Data Protection & PDPL

- **Encryption:** TLS 1.2+ in transit; encryption at rest (DB + object storage + backups).
- **Consent** recorded before location/biometric capture; versioned policy.
- **Data minimization:** collect only what's needed; biometrics stored as **templates**, not raw images.
- **Retention & deletion:** configurable windows; purge jobs; **data-subject requests** (access/delete) supported (Phase 2).
- **Residency:** in-region storage/processing per tenant.
- **PII in logs:** never log passwords, OTPs, tokens, full location traces, or media content; scrub/redact structured logs.
- **Backups:** encrypted, access-controlled, tested restores; backups honor residency.

---
---

## 11. Secrets Management

- **All secrets in a cloud Secret Manager / Vault** — DB creds, signing keys, FCM, SMS, MyFatoorah, SES keys. **Never in code, `.env` in git, images, or logs.**
- Injected at runtime; rotated on a schedule and on suspected compromise.
- **Least-privilege service accounts** per service; scoped, short-lived credentials where possible.
- **CI/CD secrets** in the pipeline's encrypted store; no secrets in build logs.
- **Pre-commit + CI secret scanning** (gitleaks) blocks accidental commits.

---
---

## 12. Transport, Network & Headers

- **HTTPS everywhere**, HSTS, TLS 1.2+; no plaintext endpoints.
- **Security headers:** CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`/frame-ancestors, `Referrer-Policy`, `Permissions-Policy`.
- **CORS:** strict allow-list of ARA Tasks origins; credentials only for trusted origins.
- **Cookies:** `httpOnly`, `Secure`, `SameSite=Strict` for refresh; CSRF protection (double-submit/SameSite) on cookie-auth routes.
- **Private data services** (DB/Redis/storage) not publicly reachable; access via VPC/private networking + IAM.
- **Webhooks** (MyFatoorah) verified by **signature**; idempotent; replay-protected.

---
---

## 13. Application Hardening

- **Dependency security:** Dependabot/Renovate + Snyk; lockfiles pinned; SBOM.
- **Container security:** minimal base images (`node:24`), non-root user, image scanning, read-only FS where possible.
- **Error handling:** generic client errors (no stack traces/internals leaked); detailed logs server-side only.
- **Idempotency keys** on offline-backed writes (check-in/submit/proof) prevent duplicate/replayed effects.
- **Business-rule invariants** live in the domain layer (submission gate, consent gate, no self-decision) — not bypassable via the API.

---
---

## 14. Audit, Logging & Monitoring

- **Immutable audit trail** (`audit_logs`, append-only, DB-enforced) records every sensitive action with actor, scope, before/after, IP, time (`BR-C-05`) — approvals, corrections, permission/role changes, data access, impersonation.
- **Operator break-glass** writes to both platform and tenant audit trails.
- **Security monitoring:** alerts on brute-force, refresh-token reuse, geofence/device anomaly spikes, mass exports, privilege changes, impersonation sessions.
- **Error/trace tooling:** Sentry + OpenTelemetry; centralized structured logs (PII-scrubbed).
- **Incident response:** documented runbook; ability to revoke sessions/keys, suspend accounts, and rotate secrets quickly.

---
---

## 15. Control → Risk Map

| Risk | Primary controls |
|---|---|
| Cross-tenant leakage | Scope engine + RLS + IDOR checks + namespaced media (§3, §6, §7) |
| Attendance fraud | Geofence + device binding + mock-location + server re-validation (§8) |
| Privilege escalation | Deny-by-default RBAC, per-request resolution, invariant guards (§3) |
| Token theft | Short-lived JWT, rotating refresh + reuse detection, in-memory access, httpOnly cookie (§2) |
| PII/media exposure | Private buckets, signed URLs, encryption, retention, log scrubbing (§6, §10) |
| Operator over-reach | Separate plane, break-glass consent + dual audit, no default data access (§9) |
| Injection/XSS/CSRF | Zod validation, parameterized SQL, CSP/headers, SameSite cookies (§5, §12) |
| Brute force / abuse | Rate limits, lockout, WAF, uniform responses (§4) |
| Secret leakage | Secret manager, scanning, least-privilege accounts (§11) |

---
---

## 16. Pre-Launch Security Checklist

- [ ] RLS enabled on **every** tenant table; verified with cross-tenant tests.
- [ ] RBAC guards on **every** mutating endpoint; deny-by-default confirmed.
- [ ] Refresh-token rotation + reuse detection working; logout-all revokes.
- [ ] Rate limits + lockout on auth/OTP; uniform enumeration responses.
- [ ] All buckets private; only signed URLs; upload type/size enforced server-side.
- [ ] Zod validation on all inputs; parameterized queries only.
- [ ] Security headers (CSP/HSTS/…) + strict CORS in place.
- [ ] Secrets only in the secret manager; secret scanning in CI; no PII in logs.
- [ ] Operator 2FA enforced; break-glass dual-audit + banner verified.
- [ ] Consent gate blocks location without consent; retention/purge jobs run.
- [ ] Audit trail immutable and covering all sensitive actions.
- [ ] Dependency + container scans clean; base images pinned.
- [ ] Third-party **penetration test** before public launch.

---

*Next in the chain: the **prioritized backlog / sprint plan**, where each story that touches auth, data, or media cites the controls here as acceptance criteria.*
