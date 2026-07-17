# ARA Tasks — Decision Log (ADR-lite)

> **Every decision that shapes the system lands here** — including decisions *not* to change something.
> Maintained under the state rule in [`CLAUDE.md`](../../CLAUDE.md).
>
> **This is also the gate on the locked stack.** The stack in `Ara_Tasks_Tech_Stack_Finalization.md` is locked. To swap, add, or remove a major dependency, or to deviate from a design doc, **you record the proposal here first and get it accepted — you do not act first.** A change that appears in code without an entry here gets reverted, not debated.
>
> Append-only. Superseding a decision = a **new row** that references the old one; never edit or delete history.

---

## Accepted

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-17 | **Mobile app kept in a separate repo (`ara-mobile`).** This repo scaffolds no Dart/Flutter; `S0-02` (Flutter scaffold + `ara_ui`/`ara_core`) is owned by that repo. | Turborepo/pnpm does not manage Dart; melos is Dart-native. Forcing Flutter into a JS monorepo buys nothing and costs tooling friction on both sides. Consistent with Tech Stack §13. Contract between the repos stays the OpenAPI/Zod API contract in `@ara/types` — the mobile repo consumes the API, not the packages. |

---

## Proposed / Open

| Date | Proposal | Status | Notes |
|---|---|---|---|
| — | *(none)* | — | Propose changes to the locked stack or a design doc here. Do not implement before acceptance. |

---

## Inherited — already settled in the design docs

Recorded here so nobody re-litigates them. These are **not open**; each has a rationale in its source doc.

| Decision | Source |
|---|---|
| Modular monolith for the tenant plane + a physically separate operator service | `Ara_Tasks_System_Architecture.md` (`AD-1`) |
| Drizzle ORM over Prisma — direct SQL control for PostGIS geography types and RLS policies | `Ara_Tasks_Tech_Stack_Finalization.md` §5 |
| Self-built auth (jose + argon2 + TOTP) over a managed identity provider — data residency, custom device binding, two token audiences | `Ara_Tasks_Tech_Stack_Finalization.md` §6 |
| Permissions resolved per request (Redis-cached), never baked into the JWT — makes revocation instant | `Ara_Tasks_Tech_Stack_Finalization.md` §6 · `Ara_Tasks_Security_Design.md` |
| Shared DB + `tenant_id` + RLS as the backstop under the app scope engine | `Ara_Tasks_Tech_Stack_Finalization.md` §5 |
| Custom component library (`@ara/ui`), no UI kit (MUI/AntD) | `Ara_Tasks_Tech_Stack_Finalization.md` §2 |
| Node 24 LTS — production runs LTS/stable only; do not ship on a "Current" line | `Ara_Tasks_Tech_Stack_Finalization.md` §17 |

---

## Deferred — needs an external input (`⚠️`)

These are **not** decisions to make in code. They need a contract or a compliance answer.

| Item | Blocking | Needed |
|---|---|---|
| **Hosting region** — GCP Dammam (KSA) vs AWS Bahrain (me-south-1) / UAE (me-central-1) | Nothing in code; **must be settled before production** | Confirm the region carries the PDPL/compliance certs the target clients require. Most important open item (Tech Stack §16). |
| **SMS vendor** — Unifonic vs Taqnyat (Twilio fallback) | `S0-15` proceeds on a sandbox adapter meanwhile | Pick at contract stage on price + deliverability + OTP support. |
