// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { checkCelSyntax } from "@/components/common/celLinter";
import { browserApiClient } from "@/services/devGuardApi";
import { useEffect, useRef, useState } from "react";

export interface VexRuleMatchCount {
  // Syntax error of the current expression, or null when it parses.
  syntaxError?: ReturnType<typeof checkCelSyntax>;
  hasSyntaxError?: boolean;
  // A request is in flight for the current expression.
  isTesting?: boolean;
  // The /test call failed (network, or the backend rejected the expression).
  testingError?: string | null;
  // How many vulnerabilities of this asset the expression matches; null while
  // unknown (empty, invalid or not yet tested).
  matchCount: number | null;
}

/**
 * Counts the vulnerabilities an expression would match, via the rule test
 * endpoint. Debounced, and only reported while it belongs to the current
 * expression so no stale count lingers during edits.
 */
export function useVexRuleMatchCount(
  baseUrl: string,
  celExpression: string,
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
        const resp = await browserApiClient(baseUrl + "/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ celExpression: [expression] }),
        });

        if (!resp.ok) {
          setTestingError("Failed to test CEL expression");
          return;
        }
        setTestingError(null);

        const data: Record<string, number> = await resp.json();
        setMatchResult({ expr: expression, count: data[expression] ?? 0 });
      } finally {
        setIsTesting(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [celExpression, hasSyntaxError, baseUrl]);

  return {
    syntaxError,
    hasSyntaxError,
    isTesting,
    testingError,
    matchCount,
  };
}
