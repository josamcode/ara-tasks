#!/usr/bin/env bash
# ARA Tasks — workflow validation (S0-05).
# =============================================================================
# Lints .github/workflows/*.yml with actionlint, pinned to an EXACT release and
# verified by SHA-256 — without adding a permanent dependency to the repo.
#
# Resolution order:
#   1. An `actionlint` already on PATH  → use it as-is.
#   2. Docker (opt-in: ACTIONLINT_USE_DOCKER=1) → official image pinned by digest.
#   3. Download the pinned release tarball for this OS/arch, verify its SHA-256,
#      then run it from a throwaway temp dir.
# =============================================================================
set -euo pipefail

ACTIONLINT_VERSION="1.7.7"
# Multi-arch image digest for rhysd/actionlint:${ACTIONLINT_VERSION} (immutable).
ACTIONLINT_IMAGE="rhysd/actionlint:1.7.7@sha256:887a259a5a534f3c4f36cb02dca341673c6089431057242cdc931e9f133147e9"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

# Pinned SHA-256 checksums for the v${ACTIONLINT_VERSION} release assets
# (source: actionlint_${ACTIONLINT_VERSION}_checksums.txt).
sha256_for() {
  case "$1" in
    linux_amd64) echo "023070a287cd8cccd71515fedc843f1985bf96c436b7effaecce67290e7e0757" ;;
    linux_arm64) echo "401942f9c24ed71e4fe71b76c7d638f66d8633575c4016efd2977ce7c28317d0" ;;
    darwin_amd64) echo "28e5de5a05fc558474f638323d736d822fff183d2d492f0aecb2b73cc44584f5" ;;
    darwin_arm64) echo "2693315b9093aeacb4ebd91a993fea54fc215057bf0da2659056b4bc033873db" ;;
    *) echo "" ;;
  esac
}

detect_platform() {
  local os arch
  case "$(uname -s)" in
    Linux) os="linux" ;;
    Darwin) os="darwin" ;;
    *) return 1 ;;
  esac
  case "$(uname -m)" in
    x86_64 | amd64) arch="amd64" ;;
    aarch64 | arm64) arch="arm64" ;;
    *) return 1 ;;
  esac
  echo "${os}_${arch}"
}

run_actionlint() {
  echo "==> actionlint version: $("$1" --version 2>/dev/null | head -n1)"
  echo "==> Linting .github/workflows ..."
  "$1" -color
  echo "==> actionlint: no problems found."
}

# 1) Pre-installed actionlint wins.
if command -v actionlint >/dev/null 2>&1; then
  echo "==> Using actionlint from PATH."
  run_actionlint "$(command -v actionlint)"
  exit 0
fi

# 2) Optional: pinned Docker image by immutable digest.
if [[ "${ACTIONLINT_USE_DOCKER:-0}" == "1" ]] && command -v docker >/dev/null 2>&1; then
  echo "==> Using actionlint via Docker (${ACTIONLINT_IMAGE%@*}, pinned by digest)."
  exec docker run --rm -v "${REPO_ROOT}:/repo:ro" --workdir /repo "${ACTIONLINT_IMAGE}" -color
fi

# 3) Download the pinned release, verify checksum, run.
platform="$(detect_platform || true)"
expected="$(sha256_for "${platform:-none}")"
if [[ -z "${platform}" || -z "${expected}" ]]; then
  echo "ERROR: no pinned actionlint checksum for this platform ('${platform:-unknown}')." >&2
  echo "       Install actionlint manually (https://github.com/rhysd/actionlint)" >&2
  echo "       or set ACTIONLINT_USE_DOCKER=1, then re-run." >&2
  exit 1
fi

tarball="actionlint_${ACTIONLINT_VERSION}_${platform}.tar.gz"
url="https://github.com/rhysd/actionlint/releases/download/v${ACTIONLINT_VERSION}/${tarball}"
tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT

echo "==> Downloading actionlint v${ACTIONLINT_VERSION} (${platform})"
curl --fail --silent --show-error --location --output "${tmp}/${tarball}" "${url}"

echo "==> Verifying SHA-256"
if ! echo "${expected}  ${tmp}/${tarball}" | sha256sum --check --status; then
  echo "ERROR: checksum mismatch for ${tarball} — refusing to run." >&2
  exit 1
fi

tar -xzf "${tmp}/${tarball}" -C "${tmp}" actionlint
chmod +x "${tmp}/actionlint"
run_actionlint "${tmp}/actionlint"
