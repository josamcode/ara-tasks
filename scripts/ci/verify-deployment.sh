#!/usr/bin/env bash
# ARA Tasks — post-deployment reachability verification (S0-05).
# =============================================================================
# Verifies, with bounded retries, that a deployment is actually serving:
#   • WEB_URL       returns 2xx  (tenant dashboard renders /)
#   • OPERATOR_URL  returns 2xx  (operator console renders /)
#   • API_URL       returns API_EXPECTED_STATUS (default 404 — the empty NestJS
#                   scaffold has no root route yet; point this at a real health
#                   endpoint once one exists, by changing the env var only)
#
# Deterministic + bounded: fails (non-zero) if any target does not reach its
# expected status within VERIFY_RETRIES × VERIFY_INTERVAL_SECONDS.
#
#   Optional env: VERIFY_RETRIES (default 30), VERIFY_INTERVAL_SECONDS (default 10)
# =============================================================================
set -euo pipefail

WEB_URL="${WEB_URL:-}"
API_URL="${API_URL:-}"
OPERATOR_URL="${OPERATOR_URL:-}"
API_EXPECTED_STATUS="${API_EXPECTED_STATUS:-404}"
RETRIES="${VERIFY_RETRIES:-30}"
INTERVAL="${VERIFY_INTERVAL_SECONDS:-10}"

missing=""
[[ -z "${WEB_URL}" ]] && missing="${missing} WEB_URL"
[[ -z "${API_URL}" ]] && missing="${missing} API_URL"
[[ -z "${OPERATOR_URL}" ]] && missing="${missing} OPERATOR_URL"
if [[ -n "${missing}" ]]; then
  echo "ERROR: missing required variable(s):${missing}." >&2
  exit 1
fi

# curl one URL once; echo its numeric HTTP status (000 = unreachable).
http_status() {
  curl --silent --output /dev/null --write-out '%{http_code}' \
    --max-time 10 "$1" 2>/dev/null || echo "000"
}

is_2xx() { [[ "$1" =~ ^2[0-9][0-9]$ ]]; }
is_expected_api() { [[ "$1" == "${API_EXPECTED_STATUS}" ]]; }

# Poll `url` until `matcher` accepts its status, or the retry budget is spent.
wait_for() {
  local label="$1" url="$2" matcher="$3"
  local attempt=1 status
  while [[ "${attempt}" -le "${RETRIES}" ]]; do
    status="$(http_status "${url}")"
    if "${matcher}" "${status}"; then
      echo "OK: ${label} → HTTP ${status} (attempt ${attempt}/${RETRIES})."
      return 0
    fi
    echo "…waiting: ${label} → HTTP ${status} (attempt ${attempt}/${RETRIES})."
    if [[ "${attempt}" -lt "${RETRIES}" ]]; then
      sleep "${INTERVAL}"
    fi
    attempt=$((attempt + 1))
  done
  echo "FAIL: ${label} did not reach the expected status within $((RETRIES * INTERVAL))s." >&2
  return 1
}

echo "==> Verifying deployment (retries=${RETRIES}, interval=${INTERVAL}s)"
rc=0
wait_for "web (2xx)" "${WEB_URL}" is_2xx || rc=1
wait_for "operator (2xx)" "${OPERATOR_URL}" is_2xx || rc=1
wait_for "api (== ${API_EXPECTED_STATUS})" "${API_URL}" is_expected_api || rc=1

if [[ "${rc}" -ne 0 ]]; then
  echo "==> Deployment verification FAILED." >&2
  exit 1
fi
echo "==> Deployment verification PASSED."
