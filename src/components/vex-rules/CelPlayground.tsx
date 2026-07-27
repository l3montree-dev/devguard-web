// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import CelCodeBlock from "@/components/common/CelCodeBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";
import { useState, type FunctionComponent } from "react";
import VexRuleMatchStatus from "./VexRuleMatchStatus";
import { useVexRuleMatchCount } from "./useVexRuleMatchCount";

// The shapes rules are usually written in.
const EXAMPLES: Array<{ label: string; expression: string }> = [
  {
    label: "By advisory",
    expression: 'vuln.cveId == "CVE-2021-1234"',
  },
  {
    label: "By component",
    expression: 'vuln.componentPurl == "pkg:npm/lodash@5.3.2"',
  },
  {
    label: "By version range",
    expression: 'matchesPurl(vuln.componentPurl, "pkg:npm/undici@>=6.0.0")',
  },
  {
    label: "By dependency path",
    expression:
      'vuln.cveId == "CVE-2021-1234" && matchesPattern(vuln, ["*", "pkg:npm/lodash@4.17.21"])',
  },
  {
    label: "By severity",
    expression: "vuln.cve.cvss < 4.0",
  },
];

interface CelPlaygroundProps {
  // API base of this asset's VEX rules, e.g. /organizations/o/.../vex-rules
  baseUrl: string;
  // Hands the current expression over to rule creation.
  onCreateRule: (celExpression: string) => void;
}

/** A scratchpad: write an expression, see what it matches, turn it into a rule. */
const CelPlayground: FunctionComponent<CelPlaygroundProps> = ({
  baseUrl,
  onCreateRule,
}) => {
  const [celExpression, setCelExpression] = useState("");
  const status = useVexRuleMatchCount(baseUrl, celExpression);

  const canCreate =
    celExpression.trim() !== "" &&
    !status.hasSyntaxError &&
    !status.testingError;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-row flex-wrap items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Expression playground</span>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-1">
            {EXAMPLES.map((example) => (
              <Button
                key={example.label}
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => setCelExpression(example.expression)}
              >
                {example.label}
              </Button>
            ))}
          </div>
        </div>

        <p className="mb-3 text-sm text-muted-foreground">
          Try a CEL expression against this repository&apos;s vulnerabilities
          before you commit to a rule. The variable <code>vuln</code> (with
          fields such as <code>cveId</code>, <code>componentPurl</code> and{" "}
          <code>vulnerabilityPath</code>) and the helper{" "}
          <code>matchesPattern(vuln, pattern)</code> are available.
        </p>

        <CelCodeBlock
          value={celExpression}
          onChange={setCelExpression}
          height={80}
          placeholder={`// pick an example above, or write your own\n// vuln.cveId == "CVE-2021-1234"`}
        />

        <div className="mt-2 flex flex-row flex-wrap items-center gap-2">
          <VexRuleMatchStatus status={status} />
          <Button
            size="sm"
            variant="default"
            className="ml-auto mt-2"
            disabled={!canCreate}
            onClick={() => onCreateRule(celExpression)}
          >
            Create rule from this expression
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CelPlayground;
