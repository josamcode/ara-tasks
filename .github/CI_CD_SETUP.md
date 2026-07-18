# ARA Tasks — CI/CD setup (S0-05)

**Ticket:** `S0-05` — GitHub Actions CI: lint → typecheck → test → build → migrate → deploy dev/staging.
**Pipeline:** [`.github/workflows/ci.yml`](workflows/ci.yml). **Deploy target:** the existing VPS via **Coolify**
(`S0-04`, see [`deploy/vps/README.md`](../deploy/vps/README.md)).

This document is the **one-time remote setup** a maintainer performs in the GitHub UI and Coolify so that
`merge to main deploys to staging`. Until every step here is done, the repository side is complete and verified,
but **remote acceptance is pending** — the pipeline cannot deploy without the Environments, secrets, and Coolify
resources below.

---

## How the pipeline behaves

| Trigger | Validation gates | Deploy |
|---|---|---|
| `pull_request` | ✅ run | ❌ never (no environment, no secrets) |
| `push` to `main` | ✅ run | ✅ automatic → **`staging`** |
| `workflow_dispatch` | ✅ run | ✅ manual → **`development`** or **`staging`** (you choose) |

Validation = `install → format:check → lint → typecheck → test → build`, plus both Docker Compose
configurations render (`S0-03` root, and root **+** the `S0-04` staging override).

**Why a PR can never reach deployment secrets**

1. The pipeline uses `pull_request`, **not** `pull_request_target` — fork PRs run with a read-only token and get **no** secrets.
2. The `validate` job declares no `environment:` and reads no secrets.
3. The `deploy` job (the only one that references environment secrets) is gated `if: github.event_name != 'pull_request'`.
4. GitHub only exposes an Environment's secrets to a job that names it; the deployment-branch policy (staging ⇒ `main`) is the backstop.

---

## Step 1 — Create the two GitHub Environments

Repository → **Settings → Environments → New environment**. Create **both**, spelled exactly:

- `development`
- `staging`

For **`staging`**, add a **Deployment branch rule** limiting deployments to the **`main`** branch
(Environment → *Deployment branches and tags* → *Selected branches* → add `main`). This guarantees only `main`
can deploy to staging. (Optionally add required reviewers to either environment for a manual approval gate.)

## Step 2 — Create separate Coolify resources + deploy webhooks

In Coolify, inside the isolated **`ara-tasks`** project (see `deploy/vps/README.md` §1–2), create **two separate
resources / environments** so development and staging never share containers, volumes, or data:

- a **`staging`** Compose resource (tracks branch **`main`**), and
- a **`development`** Compose resource (deployed manually / on demand).

For **each** resource, obtain its **deploy webhook URL** (Coolify → the resource → *Webhooks* / the API deploy
endpoint for that resource). Each environment has its **own** webhook pointing at its **own** resource.

## Step 3 — Create a least-privilege Coolify API token

Coolify → **Keys & Tokens / API tokens → Create**. Grant the **minimum `deploy` permission only** — no read of
tenant data, no account management, no root/admin scope. This token authenticates the webhook call via
`Authorization: Bearer`. If Coolify offers per-resource tokens, prefer a separate token per environment.

## Step 4 — Add secrets + variables to each GitHub Environment

For **each** environment (`development`, `staging`), set the **same names** (values differ per environment):

**Secrets** (Environment → *Environment secrets*) — encrypted, never printed by the pipeline:

| Secret | What it is |
|---|---|
| `COOLIFY_WEBHOOK` | The deploy webhook URL for **that** environment's Coolify resource. |
| `COOLIFY_TOKEN` | The least-privilege Coolify **deploy** token. |

**Variables** (Environment → *Environment variables*) — non-secret, used by post-deploy verification:

| Variable | What it is | Note |
|---|---|---|
| `WEB_URL` | Public URL of the tenant dashboard for that environment. | must return `2xx` |
| `API_URL` | Public URL of the tenant API for that environment. | must return `API_EXPECTED_STATUS` |
| `OPERATOR_URL` | Public URL of the operator console for that environment. | must return `2xx` |
| `API_EXPECTED_STATUS` | Expected API root status. | **`404`** today (empty NestJS scaffold has no root route). Move to `200` once a real health endpoint exists — a config change, no pipeline change. |

> Do **not** hardcode any domain in Git. Domains live only in Coolify (routing) and in these Environment
> variables (verification). The repository contains no environment URLs.
>
> Optional overrides (only if needed): `COOLIFY_WEBHOOK_METHOD` (defaults to `POST`), `VERIFY_RETRIES`
> (default `30`), `VERIFY_INTERVAL_SECONDS` (default `10`).

## Step 5 — Disable Coolify auto-deploy-on-push

On **both** Coolify resources, **turn OFF** "Auto Deploy" / deploy-on-Git-push (and remove any Coolify GitHub
webhook that would deploy directly). Deployment must flow **only** through GitHub Actions, so the lint → typecheck
→ test → build → migrate gates can never be bypassed by a raw push straight to Coolify.

## Step 6 — Confirm staging tracks `main`

On the **staging** Coolify resource, confirm the configured branch is **`main`**. Combined with Step 1's
deployment-branch rule, a merge to `main` runs validation and then deploys staging — and nothing else can.

---

## Deploying

- **Staging (automatic):** merge a PR to `main`. The `validate` job runs; on success `deploy` runs against the
  `staging` environment (migration stage → Coolify trigger → reachability verification).
- **Development or staging (manual):** GitHub → **Actions → CI → Run workflow** (`workflow_dispatch`). Pick the
  **environment** input (`development` default, or `staging`). The same validation gates run before the deploy.

Deployments are **serialized per environment** and an **in-progress deploy is never cancelled**
(`concurrency: cancel-in-progress: false`); a newer queued run for the same environment supersedes an older
*queued* one only.

---

## Inspecting the evidence

- **GitHub Actions:** Actions tab → the run → the `validate` and `deploy` jobs. The migration stage prints a
  visible **notice**; the Coolify step prints only a redacted `scheme://host` (never the URL, query, or token);
  the verify step prints each target's status.
- **Coolify:** the resource → **Deployments** (history + logs) and the per-service **Logs** / health indicators.
  Confirm the deployment corresponds to the merged commit.

**Remote acceptance is proven only when** a real run shows: PR validation success · `main` pipeline success ·
migration stage success (or the explicit S0-09 pending gate) · staging deploy job success · Coolify deployment
completed for the merged commit · web/operator `2xx` · API at its configured expected status.

---

## Local checks (no GitHub/Coolify needed)

Run from the repo root inside Ubuntu WSL2:

```bash
bash scripts/ci/validate-workflows.sh        # actionlint (pinned release, checksum-verified)
bash scripts/ci/run-migration-stage.sh       # honest S0-09 pending gate (exit 0)
bash scripts/ci/trigger-coolify.sh --dry-run # input validation only, no network, no secrets required

# Health check against the local S0-04 stack (bring it up first — see deploy/vps/VERIFY.md):
WEB_URL=http://localhost:3000 API_URL=http://localhost:3001 \
OPERATOR_URL=http://localhost:3002 API_EXPECTED_STATUS=404 \
  bash scripts/ci/verify-deployment.sh
```
