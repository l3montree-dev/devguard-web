#!/usr/bin/env bash
# Spins up the same backend stack .github/workflows/e2e.yml uses (docker
# compose, ghcr.io/l3montree-dev/devguard:main + postgresql) and builds and
# starts the frontend from this checkout, both against localhost. Stays in
# the foreground once ready — run the e2e suite yourself in another shell
# (npm run e2e) or drive it interactively. Ctrl+C (or closing this shell)
# stops the frontend and the backend containers.
#
# Run from the devguard-web repo root: ./e2e/run-local.sh
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
REPO_ROOT="$PWD"
COMPOSE_DIR="$REPO_ROOT/.github/e2e"

FRONTEND_PID=""

cleanup() {
  echo "==> Stopping"
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
  fi
  (cd "$COMPOSE_DIR" && docker compose stop)
}
trap cleanup EXIT INT TERM

# macOS ships no GNU `timeout`; poll manually instead.
wait_for() {
  local url="$1" seconds="$2" waited=0
  until curl -sf "$url" > /dev/null 2>&1; do
    if (( waited >= seconds )); then
      echo "Timed out waiting for $url" >&2
      return 1
    fi
    sleep 3
    waited=$((waited + 3))
  done
}

echo "==> Starting backend services (postgresql, kratos, devguard-api)"
(cd "$COMPOSE_DIR" && docker compose up -d)

echo "==> Waiting for kratos..."
wait_for http://localhost:4434/admin/health/alive 120
echo "Kratos ready."


echo "==> Waiting for devguard-api..."
wait_for http://localhost:8080/api/v1/health/ 120
echo "Backend ready."

# Values match .github/workflows/e2e.yml's frontend .env, passed as env vars
# instead so this script never touches the checked-in .env files.
export ORY_SDK_URL=http://localhost:4433
export ORY_SDK_PUBLIC_URL=http://localhost:3000
export DEVGUARD_API_URL=http://localhost:8080
export DEVGUARD_API_URL_PUBLIC_INTERNET=http://localhost:8080
export FRONTEND_URL=http://localhost:3000
export REGISTRATION_ENABLED=true
export DEVGUARD_DOMAIN=http://localhost:3000
export DEVGUARD_EMAIL_LOGIN_USERNAME=test-user-XXX
export DEVGUARD_EMAIL_LOGIN_PASSWORD=Test1234!secure
export OPEN_CODE_USERNAME=placeholder
export OPEN_CODE_PASSWORD=placeholder
export OPEN_CODE_TOTP_SECRET=placeholder
export NEXT_TELEMETRY_DISABLED=1
export E2E_TESTS=true

echo "==> Building frontend"
npm run build

echo "==> Starting frontend"
npm run start &
FRONTEND_PID=$!

echo "==> Waiting for frontend..."
wait_for http://localhost:3000 120
echo "Frontend ready."

echo
echo "==> Environment ready at http://localhost:3000"
echo "    Run tests in another shell with: npm run e2e"
echo "    Press Ctrl+C here to stop the frontend and backend."
echo

wait "$FRONTEND_PID"
