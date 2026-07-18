# ARA Tasks — VPS pre-deployment checklist

Run this **before the first Coolify deploy** and before any major update. The VPS is **shared** — the goal
is to confirm ARA Tasks fits and stays isolated, and that you can recover if something goes wrong. Commands
are read-only diagnostics; run them on the VPS.

## 1. Disk space

- [ ] Enough free disk for images + volumes (rough budget: **≥ 8 GB** free for images/build cache, plus
      headroom for Postgres/MinIO data growth).
  ```bash
  df -h /            # root / Docker data-root free space
  docker system df   # image / container / volume / build-cache usage
  ```

## 2. Memory

- [ ] Enough free RAM for the staging stack's reservations/limits (this override caps at ~**3.5 GB** total,
      reserves ~**0.7 GB**). Leave headroom for the other projects already on the box.
  ```bash
  free -h
  docker stats --no-stream   # current per-container memory of everything already running
  ```

## 3. Existing port conflicts

- [ ] ARA Tasks publishes **no** public host ports (data services private; apps via Coolify proxy). Confirm
      nothing in the override would clash, and that the Coolify proxy (80/443) is the only public ingress.
  ```bash
  sudo ss -tlnp | grep -E ':(80|443|3000|3001|3002|5432|6379|9000|9001)\b' || echo "no conflicts on those ports"
  ```
  The staging override binds only `127.0.0.1` (loopback) for local checks; on the VPS you normally rely on
  Coolify's proxy, so even loopback clashes are unlikely. Adjust `*_PORT` in Coolify env only if needed.

## 4. Docker network isolation

- [ ] ARA Tasks will run on its **own** network (Coolify creates one per compose resource; the compose file's
      `ara-net` + `name: ara-tasks` scope keep it separate). Confirm you are not reusing another project's network.
  ```bash
  docker network ls
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml config | grep -A3 'networks:'
  ```

## 5. Volume names

- [ ] The named volumes do not collide with an existing project's volumes. With `name: ara-tasks` in the
      compose file, Docker prefixes them `ara-tasks_ara-postgres-data`, etc. Confirm they are new (first deploy)
      or the intended ARA Tasks volumes (update).
  ```bash
  docker volume ls | grep -E 'ara-(postgres|redis|minio)-data' || echo "no ARA Tasks volumes yet (fresh deploy)"
  ```

## 6. Backup readiness

- [ ] A backup destination **outside** the app volumes exists and is reachable, and you have tested a restore
      at least once (see `BACKUP_RESTORE.md`). Do not deploy staging data you cannot recover.
- [ ] Secrets are staged in **Coolify's encrypted env** (never in Git); none of the repo's local-dev defaults
      are used on the VPS.

## 7. Compose sanity (from a repo checkout)

- [ ] The merged config renders and data services are private:
  ```bash
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml config --quiet && echo OK
  # Expect NO published ports for postgres/redis, and only 127.0.0.1 for minio's 9000:
  docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml config \
    | grep -nE 'published|host_ip' || echo "no host-published ports at all"
  ```

Only proceed to `README.md` §1 once every box is checked.
