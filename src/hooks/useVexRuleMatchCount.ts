// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { checkCelSyntax } from "@/components/common/celLinter";
import type { AssetScope } from "@/services/vexRuleService";
import { testVexRules } from "@/services/vexRuleService";

import type {
  VexRuleEventType,
  VexRuleMatchCount,
} from "@/types/view/vexRules";
import { useEffect, useRef, useState } from "react";

/**
 * Counts the vulnerabilities an expression would match, via the rule test
 * endpoint. Debounced, and only reported while it belongs to the current
 * expression so no stale count lingers during edits.
 */
export function useVexRuleMatchCount(
  scope: AssetScope,
  celExpression: string,
  // The backend requires an event type to know which vulnerability scope to
  // match against; default to falsePositive when the caller has none to offer.
  eventType: VexRuleEventType = "falsePositive",
): VexRuleMatchCount {
  const [isTesting, setIsTesting] = useState(false);
  const [testingError, setTestingError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<{
    expr: string;
    count: number;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syntaxError =
    celExpression.trim() !== "" ? checkCelSyntax(celExpression) : null;
  const hasSyntaxError = syntaxError !== null;

  const matchCount =
    !hasSyntaxError && matchResult?.expr === celExpression.trim()
      ? matchResult.count
      : null;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const expression = celExpression.trim();
    if (!expression || hasSyntaxError) return;

    debounceRef.current = setTimeout(async () => {
      setIsTesting(true);
      try {
        let counts: Record<string, number>;
        try {
          counts = await testVexRules(scope, {
            celExpression: [expression],
            eventType,
          } as never);
        } catch {
          setTestingError("Failed to test CEL expression");
          return;
        }
        setTestingError(null);
        setMatchResult({ expr: expression, count: counts[expression] ?? 0 });
      } finally {
        setIsTesting(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [celExpression, hasSyntaxError, scope, eventType]);

  return {
    syntaxError,
    hasSyntaxError,
    isTesting,
    testingError,
    matchCount,
  };
}
