// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { checkCelSyntax } from "@/components/common/celLinter";
import { testAssetVersionRetentionPolicy } from "@/services/assetService";
import type { components } from "@/types/api/generated";
import { useEffect, useState } from "react";
import { useAssetScope } from "./useAssetScope";

type TestResult =
  components["schemas"]["dtos.TestAssetVersionRetentionPolicyResponse"];

/**
 * Dry-runs a retention policy against the asset's current branches and tags.
 * Debounced, and a result or error is only reported while it belongs to the
 * current policy, so nothing stale lingers during edits.
 */
export function useRetentionPolicyTest(policy: string) {
  const scope = useAssetScope();
  const [outcome, setOutcome] = useState<{
    policy: string;
    result?: TestResult;
    error?: string;
  } | null>(null);

  const expression = policy.trim();
  const hasSyntaxError =
    expression !== "" && checkCelSyntax(expression) !== null;
  const { organization, projectSlug, assetSlug } = scope;

  useEffect(() => {
    if (!expression || hasSyntaxError) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const result = await testAssetVersionRetentionPolicy(
          { organization, projectSlug, assetSlug },
          expression,
        );
        if (!cancelled) setOutcome({ policy: expression, result });
      } catch (e) {
        if (!cancelled) {
          setOutcome({
            policy: expression,
            error: e instanceof Error ? e.message : "Could not test the policy",
          });
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [expression, hasSyntaxError, organization, projectSlug, assetSlug]);

  const current = outcome?.policy === expression ? outcome : null;
  return {
    isTesting: expression !== "" && !hasSyntaxError && current === null,
    // the last result stays visible while the next one loads, so the preview
    // does not flicker on every keystroke - isTesting marks it as outdated
    result: outcome?.result ?? null,
    error: current?.error ?? null,
  };
}
