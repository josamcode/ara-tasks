#!/usr/bin/env bash
# ARA Tasks — Coolify deployment trigger (S0-05).
# =============================================================================
# Triggers a Coolify deploy webhook for the current GitHub Environment.
#
#   Required env (real run): COOLIFY_WEBHOOK, COOLIFY_TOKEN  (environment secrets)
#   Optional env:            COOLIFY_WEBHOOK_METHOD  (HTTP method; default POST)
#
# Guarantees:
#   • NEVER prints the webhook URL or the token (only a scheme://host redaction).
#   • Fails on missing config, network failure, unauthorized, or any non-2xx.
#   • --dry-run exercises input validation WITHOUT a network request and WITHOUT
#     requiring real secrets — so wiring can be tested locally and in CI.
# =============================================================================
set -euo pipefail

DRY_RUN="false"
for arg in "$@"; do
  case "${arg}" in
    --dry-run) DRY_RUN="true" ;;
    -h | --help)
      echo "Usage: trigger-coolify.sh [--dry-run]"
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument '${arg}'." >&2
      exit 2
      ;;
  esac
done

METHOD="${COOLIFY_WEBHOOK_METHOD:-POST}"
WEBHOOK="${COOLIFY_WEBHOOK:-}"
TOKEN="${COOLIFY_TOKEN:-}"

# Redact a URL to scheme://host — never expose path, query string, or any creds.
redact_url() {
  local url="$1"
  if [[ "${url}" =~ ^([a-zA-Z][a-zA-Z0-9+.-]*)://([^/@]*@)?([^/:?#]+) ]]; then
    printf '%s://%s' "${BASH_REMATCH[1]}" "${BASH_REMATCH[3]}"
  else
    printf '(unparseable url)'
  fi
}

# The webhook must be https (http accepted only for explicit localhost testing).
validate_webhook_shape() {
  if [[ "${WEBHOOK}" =~ ^https:// ]]; then
    return 0
  fi
  if [[ "${WEBHOOK}" =~ ^http://(localhost|127\.0\.0\.1)(:|/|$) ]]; then
    return 0
  fi
  echo "ERROR: COOLIFY_WEBHOOK must be an https:// URL." >&2
  return 1
}

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "[dry-run] Coolify trigger — validating inputs only (no network request)."
  echo "[dry-run] Method: ${METHOD}"
  if [[ -z "${WEBHOOK}" || -z "${TOKEN}" ]]; then
    echo "[dry-run] COOLIFY_WEBHOOK / COOLIFY_TOKEN are not set — REQUIRED for a real deploy."
    echo "[dry-run] Input-validation path OK (secrets intentionally not required in dry-run)."
    exit 0
  fi
  validate_webhook_shape || exit 1
  echo "[dry-run] Webhook target: $(redact_url "${WEBHOOK}") (redacted)"
  echo "[dry-run] Token present: yes (length ${#TOKEN}; value never printed)"
  echo "[dry-run] OK — would send ${METHOD} with header 'Authorization: Bearer <token>'."
  exit 0
fi

# --- Real deployment trigger -------------------------------------------------
missing=""
[[ -z "${WEBHOOK}" ]] && missing="${missing} COOLIFY_WEBHOOK"
[[ -z "${TOKEN}" ]] && missing="${missing} COOLIFY_TOKEN"
if [[ -n "${missing}" ]]; then
  echo "ERROR: missing required environment secret(s):${missing}." >&2
  exit 1
fi
validate_webhook_shape || exit 1

echo "==> Triggering Coolify deploy: ${METHOD} $(redact_url "${WEBHOOK}") (redacted)"

http_code="$(
  curl --silent --show-error \
    --request "${METHOD}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --max-time 30 \
    --retry 2 --retry-connrefused \
    --output /dev/null \
    --write-out '%{http_code}' \
    "${WEBHOOK}"
)" || {
  echo "ERROR: network failure calling the Coolify webhook." >&2
  exit 1
}

if [[ "${http_code}" -ge 200 && "${http_code}" -lt 300 ]]; then
  echo "==> Coolify accepted the deploy trigger (HTTP ${http_code})."
  exit 0
fi

echo "ERROR: Coolify webhook returned HTTP ${http_code} (expected 2xx)." >&2
if [[ "${http_code}" == "401" || "${http_code}" == "403" ]]; then
  echo "       -> unauthorized: verify COOLIFY_TOKEN and that it holds only the deploy permission." >&2
fi
exit 1
