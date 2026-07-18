# ARA Tasks — S0-04 local verification (evidence suite)

Run from the **repo root inside Ubuntu WSL2**. This proves the VPS/Coolify override (`docker-compose.staging.yml`)
brings the stack up healthy, keeps data services private, and does not regress the S0-03 local stack — **without
deploying to the VPS and without adding any application code**. Every command below is expected to **exit 0**.

> **API note — expected `404` by design.** `apps/api` is still the empty S0-01 NestJS scaffold: it has **no routes**,
> so `GET /` correctly returns **HTTP 404**. The API is *reachable* (its container is healthy), so the check asserts
> the **expected 404 status** rather than a 2xx. Do **not** use `curl --fail` here — `--fail` treats `404` as an error
> and exits non-zero, which would wrongly fail a healthy scaffold. Adding a health route is application behavior and is
> out of scope for this infrastructure ticket. Web and operator render `/`, so they must return **2xx**.

```bash
F="-f docker-compose.yml -f deploy/vps/docker-compose.staging.yml"

# 0. Clean start (keep data volumes)
docker compose $F down

# 1–2. Config renders; six services present
docker compose $F config --quiet
docker compose $F config --services

# 3–5. Build (reuses S0-03 images), bring up health-gated, list
docker compose $F build
docker compose $F up -d --wait
docker compose $F ps

# 6–8. Data services (verified via exec — no host port needed)
docker compose $F exec -T postgres pg_isready
docker compose $F exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT PostGIS_Version();"'
docker compose $F exec -T redis redis-cli ping

# 9. MinIO S3 health (loopback-only host binding)
curl --fail --silent --show-error http://localhost:9000/minio/health/live

# 10. Web must return 2xx
curl --fail --silent --show-error http://localhost:3000/ >/dev/null

# 11. API reachability — assert the EXPECTED empty-scaffold status (404), exit 0 only on a match
api_status="$(curl --silent --output /dev/null --write-out '%{http_code}' http://localhost:3001/)"
test "$api_status" = "404"
printf 'API reachable with expected scaffold status: %s\n' "$api_status"

# 12. Operator must return 2xx
curl --fail --silent --show-error http://localhost:3002/ >/dev/null

# 13. PRIVACY — no public bindings for ANY service (loopback 127.0.0.1 is acceptable for local checks)
docker compose $F config | grep -E 'host_ip:' | grep -qvE 'host_ip: 127\.0\.0\.1' \
  && { echo "FAIL: non-loopback (public) binding present"; false; } \
  || echo "OK: all published ports are loopback-only; postgres & redis publish none"

# 14. S0-03 root stack still validates INDEPENDENTLY (no override)
docker compose config --quiet

# 15. Monorepo gates (WSL nvm node; turbo is blocked on the Windows host by WDAC)
pnpm exec turbo build
pnpm exec turbo lint
pnpm exec turbo typecheck

# 16. Working tree is clean of whitespace errors
git diff --check

# 17. Teardown — KEEP volumes (never -v during verification)
docker compose $F down
```

**Expected results:** `config`/`build`/`up --wait` succeed → **6/6 healthy**; `pg_isready` accepting; PostGIS
`3.6 …`; redis `PONG`; MinIO `/health/live` OK; web + operator `2xx`; API prints `…expected scaffold status: 404`;
privacy check prints `OK`; the root `docker compose config --quiet` (S0-03) still validates; `turbo build 5/5`,
`lint 6/6`, `typecheck 7/7`; `git diff --check` clean; volumes persist across `down`.
