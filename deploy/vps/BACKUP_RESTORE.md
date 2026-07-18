# ARA Tasks — backup & restore (Postgres + MinIO)

Staging data lives in named Docker volumes (`ara-postgres-data`, `ara-redis-data`, `ara-minio-data`).
**Redis is a cache/broker — not a source of truth — so it is not backed up.** Postgres and MinIO are.

> **Golden rule:** backups are written to a destination **outside** the app volumes (ideally off the VPS).
> `BACKUP_DIR` below is a **placeholder** — set a real, access-controlled destination in your ops config,
> **not** in Git. Never point a backup at the same volume it is backing up.

```bash
# Placeholder — replace with your real, secured location (e.g. a separate disk, or off-box object storage).
# Do NOT commit a real destination, credentials, or host.
BACKUP_DIR=/srv/backups/ara-tasks          # must NOT be inside any ara-tasks_* volume
COMPOSE="docker compose -f docker-compose.yml -f deploy/vps/docker-compose.staging.yml"
STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"
```

## Postgres — backup

Logical dump (portable, includes PostGIS objects). Runs inside the container; credentials come from the
container env (never typed on the command line).

```bash
$COMPOSE exec -T postgres sh -lc \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -F c' > "$BACKUP_DIR/pg-$STAMP.dump"
```

- `-F c` = custom format → restore with `pg_restore`.
- Verify the file is non-empty and copy it **off the VPS** to your secured destination.
- Automate via a Coolify **scheduled task** / cron that runs this and ships the file off-box; keep a sensible
  retention window (PDPL-aware). Encrypt at rest.

## Postgres — restore

```bash
# Into a FRESH/empty database (stack up, DB created but empty). Adjust flags to your recovery scenario.
$COMPOSE exec -T postgres sh -lc \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < "$BACKUP_DIR/pg-<STAMP>.dump"
# Sanity check:
$COMPOSE exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT PostGIS_Version();"'
```

If the PostGIS extension is missing on a brand-new volume, the `postgis/postgis` image auto-creates it on
first init; for an existing DB, `CREATE EXTENSION IF NOT EXISTS postgis;` before restoring data.

## MinIO — backup

Mirror the bucket(s) to the backup destination with the bundled `mc` client, using the **in-container**
credentials (no secrets on the command line):

```bash
$COMPOSE exec -T minio sh -lc '
  mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null &&
  mc mirror --overwrite --remove local/"$S3_BUCKET" /tmp/minio-backup
'
# Copy the mirrored objects out of the container to the secured destination:
docker cp ara-minio:/tmp/minio-backup "$BACKUP_DIR/minio-$STAMP"
```

Prefer a dedicated backup target (a second MinIO/S3 endpoint or off-box object storage) via
`mc mirror local/<bucket> <remote>/<bucket>` in production — again, configure the remote **outside Git**.

## MinIO — restore

```bash
docker cp "$BACKUP_DIR/minio-<STAMP>" ara-minio:/tmp/minio-restore
$COMPOSE exec -T minio sh -lc '
  mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null &&
  mc mb --ignore-existing local/"$S3_BUCKET" &&
  mc mirror --overwrite /tmp/minio-restore local/"$S3_BUCKET"
'
```

## Relationship to image rollback

`README.md` §7 rolls back **code/images**, not data. A bad **data** change is recovered here (restore the
last good Postgres dump + MinIO mirror). Take a fresh backup **before** any risky migration or update, and
**test a restore** on a throwaway target regularly — an untested backup is not a backup.
