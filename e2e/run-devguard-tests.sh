#!/usr/bin/env bash
# Runs all devguard-*.e2e.spec.ts test files sequentially.
# OpenCode tests (opencode-*.e2e.spec.ts) are intentionally excluded.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Running DevGuard E2E tests..."

for spec in src/devguard-*.e2e.spec.ts; do
  echo ""
  echo ">>> $spec"
  npx playwright test --trace on "$spec"
done

echo ""
echo "All DevGuard E2E tests finished."
