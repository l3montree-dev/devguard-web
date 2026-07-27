// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { CircleAlert, CircleCheck, CircleDashed, Loader2 } from "lucide-react";
import type { FunctionComponent } from "react";
import type { VexRuleMatchCount } from "./useVexRuleMatchCount";

/**
 * The one-line verdict under a CEL editor — error, in-flight, or match count —
 * styled like inline field validation.
 */
const VexRuleMatchStatus: FunctionComponent<{
  status: VexRuleMatchCount;
  className?: string;
}> = ({ status, className }) => {
  const { syntaxError, hasSyntaxError, isTesting, testingError, matchCount } =
    status;
  const error = syntaxError?.message ?? testingError;

  const base = cn("flex flex-row items-center gap-1.5 text-xs", className);
  const icon = "h-3.5 w-3.5 shrink-0";

  if (error) {
    return (
      <FieldDescription
        role="alert"
        data-invalid
        className={cn(base, "text-destructive")}
      >
        <CircleAlert aria-hidden className={icon} />
        <span>{error}</span>
      </FieldDescription>
    );
  }

  if (isTesting) {
    return (
      <FieldDescription className={base}>
        <Loader2 aria-hidden className={cn(icon, "animate-spin")} />
        <span>Checking how many vulnerabilities this would affect...</span>
      </FieldDescription>
    );
  }

  if (hasSyntaxError || matchCount === null) return null;

  return (
    <FieldDescription aria-live="polite" className={base}>
      {matchCount > 0 ? (
        <CircleCheck aria-hidden className={cn(icon, "text-success")} />
      ) : (
        <CircleDashed aria-hidden className={icon} />
      )}
      <span>
        Matches{" "}
        <span className="font-medium text-foreground">{matchCount}</span>{" "}
        vulnerabilit{matchCount === 1 ? "y" : "ies"}
      </span>
    </FieldDescription>
  );
};

export default VexRuleMatchStatus;
