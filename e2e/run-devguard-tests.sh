#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Running DevGuard E2E tests..."

npx playwright test --project=chromium --project=chromium-authenticated --retries 1 src/devguard-*.e2e.spec.ts

echo "-----"
echo "All DevGuard E2E tests finished."