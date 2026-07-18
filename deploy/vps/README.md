# ARA Tasks — VPS / Coolify deployment (dev + staging)

**Ticket:** `S0-04`. **Status of the baseline:** dev + staging run on the **existing Hostinger VPS**
(Ubuntu 24.04, Coolify already installed), **shared with other projects**. Managed cloud (GCP/AWS) +
Terraform are a **deferred production** evolution path — see `docs/state/DECISIONS.md`.

This bundle **reuses the S0-03 images** (each app's `Dockerfile` is inherited from the root
`docker-compose.yml`; nothing is rebuilt here) and only adds the VPS runtime posture.

```
deploy/vps/
  docker-compose.staging.yml   # Coolify-compatible override (layered on the root compose)
  .env.staging.example         # every env var Coolify must supply — placeholders only
  README.md                    # this runbook
  PRE_DEPLOY_CHECKLIST.md      # run BEFORE the first deploy
  BACKUP_RESTORE.md            # Postgres + MinIO backup / restore
```

## What the override does (and the isolation guarantees)

| Service | On the VPS | Why |
|---|---|---|
| `postgres`, `redis`, `minio` | **Private** — no public host port; reachable only on the internal `ara-net` network | Data services must never be internet-exposed (Security Design §7, §12) |
| `api`, `web`, `operator` | Exposed **only** through Coolify's reverse proxy (TLS + domain routing) | One ingress; no raw ports on a shared VPS |
| `web` vs `operator` | **Separate services → separate domains**; no shared session/route | Two-plane security boundary (`BR-R-05`) |

- Named volumes (`ara-postgres-data`, `ara-redis-data`, `ara-minio-data`) persist data across restarts/updates.
- `restart: unless-stopped`, health checks (inherited), digest-pinned infra images (inherited), and
  conservative CPU/memory limits keep ARA Tasks a **good neighbour** on the shared VPS.
- The `127.0.0.1` host-port bindings in the override are **for local verification only** and are inert on
  the VPS (Coolify routes over the Docker network). They are never public.

> **Before anything below, complete `PRE_DEPLOY_CHECKLIST.md`.**

---

## 1. Create an isolated ARA Tasks project in Coolify

Isolation from the other projects on this VPS is the whole point — keep ARA Tasks in its own project.

1. Coolify → **Projects → + New Project** → name `ara-tasks`.
2. Inside it, create an **Environment** → `staging` (add `production` later; keep them separate).
3. Confirm ARA Tasks gets its **own Docker network** (Coolify creates one per compose resource). Do **not**
   attach ARA Tasks services to another project's network or volumes.

## 2. Add the Compose deployment

1. In the `ara-tasks / staging` environment → **+ New Resource → Docker Compose** (Git-based).
2. Connect the ARA Tasks Git repository and branch (Coolify builds the images from the repo Dockerfiles).
3. Point Coolify at **both** compose files so the override applies. Either:
   - set the compose file location to `docker-compose.yml` and add `deploy/vps/docker-compose.staging.yml`
     as an **additional compose file**, or
   - set the environment variable **`COMPOSE_FILE=docker-compose.yml:deploy/vps/docker-compose.staging.yml`**
     on the resource (Docker Compose reads this `:`-separated chain).
   *(Exact wording varies by Coolify version — the goal is that the rendered stack = root **+** staging override.)*
4. Do **not** enable "expose all ports"/host-port publishing — routing is by domain (step 4).

## 3. Supply secrets through Coolify's encrypted environment

1. On the resource → **Environment Variables**. Add every non-placeholder key from
   `deploy/vps/.env.staging.example`, marking secrets as **encrypted / build-secret** as appropriate.
2. Use **strong, unique** values — never the repo's local-dev defaults. In particular:
   `POSTGRES_USER/PASSWORD/DB`, `DATABASE_URL` (must match the Postgres values, host = `postgres`),
   `MINIO_ROOT_USER/PASSWORD`, `S3_ACCESS_KEY/SECRET_KEY`, `S3_BUCKET`.
3. Secrets live **only** in Coolify (encrypted at rest) — never in Git, never in logs.

## 4. Assign domains (never hardcoded in Git)

1. For **each** app service (`api`, `web`, `operator`) → set its **Domain / FQDN** in Coolify.
2. Give `web` and `operator` **different domains** — they are different planes and must not share a host/session.
3. Coolify auto-generates the reverse-proxy (Traefik) labels + Let's Encrypt TLS for each domain and routes
   `https://<domain>` → the container's exposed port (`3000`/`3001`) over the proxy network.
4. `postgres`, `redis`, `minio` get **no domain** — they stay internal.

## 5. Start / update the stack

- **Start / first deploy:** click **Deploy**. Coolify builds the images, creates the volumes + network, and
  starts all six services; health checks gate readiness.
- **Update:** push to the tracked branch and **Deploy** again (or enable auto-deploy on push). Coolify builds
  new images and recreates the app containers; the named volumes (Postgres/Redis/MinIO data) are preserved.
- Equivalent CLI (if you deploy by hand from a checkout on the VPS, inside the ARA Tasks project context):
  ```bash
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml up -d --build --wait
  ```

## 6. View health and logs

- Coolify → the resource → **Logs** (per service) and the **health** indicators.
- CLI equivalent:
  ```bash
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml ps
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml logs -f api
  ```

## 7. Roll back to the previous image

- Coolify keeps a **deployment history**. Open the resource → **Deployments** → pick the last-known-good
  deployment → **Redeploy / Rollback**. Coolify recreates the app containers from that image; the data
  volumes are untouched.
- CLI equivalent (redeploy a known-good git ref):
  ```bash
  git checkout <last-good-sha>
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml up -d --build --wait
  ```
- **Data is not rolled back** by an image rollback. For data recovery, use `BACKUP_RESTORE.md`.

## 8. Stop ARA Tasks without affecting other projects

- Coolify → the ARA Tasks resource → **Stop**. This stops only ARA Tasks' containers.
- CLI equivalent (scoped to ARA Tasks by the `name: ara-tasks` project key in the compose file):
  ```bash
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml stop      # stop, keep data
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml down       # remove containers, KEEP volumes
  ```
- **Never** run `down -v` on the shared VPS unless you intend to delete ARA Tasks' data volumes. **Never**
  run bare `docker stop $(docker ps -q)` / `docker system prune` — that would hit other projects.

---

## Guardrails on the shared VPS

- Deploy **only** into the isolated ARA Tasks project/environment. Do not touch other projects' containers,
  volumes, networks, or the Coolify system services.
- Do not modify the VPS firewall, SSH, or Docker daemon from this repo.
- Keep data services private (no domains, no published ports).
- All destructive/data operations go through Coolify or the scoped `docker compose … ` commands above.
