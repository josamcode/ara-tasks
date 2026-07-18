#!/usr/bin/env bash
# ARA Tasks — CI migration stage (S0-05).
# =============================================================================
# The single, honest contract for "run database migrations in CI".
#
#   • If @ara/api defines the canonical `db:migrate:ci` script, run it and
#     propagate its exit code (a failed migration MUST fail the deploy).
#   • Until S0-09 lands that script, emit a VISIBLE GitHub notice that the
#     migration implementation is pending S0-09, then exit 0.
#
# It NEVER creates fake migrations, empty files, placeholder schemas, or a
# success message pretending migrations ran. S0-09 activates real migrations
# simply by adding the `db:migrate:ci` script to @ara/api — this file, and the
# pipeline around it, need no redesign.
# =============================================================================
set -euo pipefail

# Repo root = two levels up from scripts/ci/.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

API_PKG="apps/api/package.json"
MIGRATE_SCRIPT="db:migrate:ci"

notice() {
  # `::notice::` renders as a visible annotation in the Actions UI; locally it
  # is simply printed. Keep the message honest — never claim migrations ran.
  printf '::notice title=%s::%s\n' "$1" "$2"
}

if [[ ! -f "${API_PKG}" ]]; then
  echo "ERROR: ${API_PKG} not found (run from the repo root)." >&2
  exit 1
fi

# Does @ara/api define the canonical migration command? Prefer node for an exact
# JSON parse; fall back to a scoped grep when node is unavailable.
has_migrate="no"
if command -v node >/dev/null 2>&1; then
  has_migrate="$(node -e 'const p=require("./apps/api/package.json"); process.stdout.write(p.scripts && p.scripts["db:migrate:ci"] ? "yes" : "no")')"
elif grep -qE '"db:migrate:ci"[[:space:]]*:' "${API_PKG}"; then
  has_migrate="yes"
fi

if [[ "${has_migrate}" == "yes" ]]; then
  echo "==> @ara/api defines '${MIGRATE_SCRIPT}'. Running CI migrations..."
  pnpm --filter @ara/api run "${MIGRATE_SCRIPT}"
  echo "==> Migrations completed."
  exit 0
fi

notice "Migrations pending S0-09" \
  "@ara/api does not define '${MIGRATE_SCRIPT}' yet. Drizzle setup + the migration pipeline land in S0-09; NO migrations were run."
echo "Migration stage SKIPPED — pending S0-09. This is the expected honest gate, not a failure."
exit 0
