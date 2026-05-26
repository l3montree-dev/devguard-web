#!/usr/bin/env bash
# Run all DevGuard E2E tests in logical order (auth → org → group → repo → scanning → sbom → ui).
#
# Usage:
#   ./run-tests.sh                  # headless
#   ./run-tests.sh --headed         # show browser
#   ./run-tests.sh --stop-on-fail   # abort after first failing suite
#   ./run-tests.sh --headed --stop-on-fail

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"
CYAN="\033[36m"
DIM="\033[2m"

# ── Parse flags ──────────────────────────────────────────────────────────────
HEADED=""
STOP_ON_FAIL=0

for arg in "$@"; do
  case "$arg" in
    --headed)         HEADED="--headed" ;;
    --stop-on-fail)   STOP_ON_FAIL=1 ;;
    *)
      echo -e "${RED}Unknown argument: $arg${RESET}"
      echo "Usage: $0 [--headed] [--stop-on-fail]"
      exit 1
      ;;
  esac
done

# ── Test suites in logical order ─────────────────────────────────────────────
# Order: auth → org → group → repo → scanning → sbom lifecycle → ui
declare -a SUITES=(
  "devguard-auth.e2e.spec.ts"
  "devguard-organization-creation.e2e.spec.ts"
  "devguard-group-management.e2e.spec.ts"
  "devguard-repository-management.e2e.spec.ts"
  "devguard-scanning.e2e.spec.ts"
  "devguard-sbom-lifecycle.e2e.spec.ts"
  "devguard-ui-interactions.e2e.spec.ts"
)

declare -a LABELS=(
  "1/7  Authentication"
  "2/7  Organization creation"
  "3/7  Group management"
  "4/7  Repository management"
  "5/7  Scanning setup"
  "6/7  SBOM lifecycle (download/upload)"
  "7/7  UI interactions & buttons"
)

# ── Tracking ─────────────────────────────────────────────────────────────────
PASSED=()
FAILED=()
START_TOTAL=$(date +%s)

# ── Run ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║         DevGuard E2E Test Suite — main.devguard.org      ║${RESET}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════╝${RESET}"
echo ""
if [[ -n "$HEADED" ]]; then
  echo -e "${DIM}  Mode : headed (browser visible)${RESET}"
else
  echo -e "${DIM}  Mode : headless${RESET}"
fi
if [[ $STOP_ON_FAIL -eq 1 ]]; then
  echo -e "${DIM}  Abort: on first failure${RESET}"
fi
echo ""

for i in "${!SUITES[@]}"; do
  SUITE="${SUITES[$i]}"
  LABEL="${LABELS[$i]}"

  echo -e "${BOLD}──────────────────────────────────────────────────────────${RESET}"
  echo -e "${BOLD}  ${LABEL}${RESET}"
  echo -e "${DIM}  File: src/${SUITE}${RESET}"
  echo ""

  START=$(date +%s)

  if npx playwright test $HEADED "src/${SUITE}"; then
    END=$(date +%s)
    echo ""
    echo -e "  ${GREEN}✔ PASSED${RESET}  ${DIM}($(( END - START ))s)${RESET}"
    PASSED+=("$LABEL")
  else
    END=$(date +%s)
    echo ""
    echo -e "  ${RED}✘ FAILED${RESET}  ${DIM}($(( END - START ))s)${RESET}"
    FAILED+=("$LABEL")

    if [[ $STOP_ON_FAIL -eq 1 ]]; then
      echo ""
      echo -e "${RED}${BOLD}Aborting — --stop-on-fail is set.${RESET}"
      break
    fi
  fi

  echo ""
done

# ── Summary ───────────────────────────────────────────────────────────────────
END_TOTAL=$(date +%s)
TOTAL=$(( END_TOTAL - START_TOTAL ))

echo -e "${BOLD}══════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  Summary  (total ${TOTAL}s)${RESET}"
echo -e "${BOLD}══════════════════════════════════════════════════════════${RESET}"
echo ""

for suite in "${PASSED[@]:-}"; do
  [[ -n "$suite" ]] && echo -e "  ${GREEN}✔${RESET}  $suite"
done

for suite in "${FAILED[@]:-}"; do
  [[ -n "$suite" ]] && echo -e "  ${RED}✘${RESET}  $suite"
done

echo ""
echo -e "  ${GREEN}Passed: ${#PASSED[@]}${RESET}   ${RED}Failed: ${#FAILED[@]}${RESET}"
echo ""

# Open the HTML report when any suite failed
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo -e "${YELLOW}  Tip: run  npx playwright show-report  for traces and screenshots.${RESET}"
  echo ""
  exit 1
fi

exit 0
