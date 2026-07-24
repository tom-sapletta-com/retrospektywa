#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "${script_dir}/.." && pwd)"
compose_file="${project_root}/compose.e2e.yaml"
project_name="retrospektywa-e2e"

cleanup() {
  docker compose \
    --project-name "${project_name}" \
    --file "${compose_file}" \
    down --remove-orphans
}

trap cleanup EXIT INT TERM

docker compose \
  --project-name "${project_name}" \
  --file "${compose_file}" \
  up \
  --build \
  --abort-on-container-exit \
  --exit-code-from e2e
