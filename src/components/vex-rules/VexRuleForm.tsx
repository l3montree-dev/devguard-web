// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import { useEffect, useRef, useState } from "react";
import type { FunctionComponent, ReactNode } from "react";
import dynamic from "next/dynamic";
import CodeEditor from "@/components/common/CodeEditor";
import { checkCelSyntax } from "@/components/common/celLinter";
import { browserApiClient } from "@/services/devGuardApi";
import { Input } from "../ui/input";

const MarkdownEditor = dynamic(
  () => import("@/components/common/MarkdownEditor"),
  {
    ssr: false,
  },
);

interface VexRuleFormProps {
  baseUrl: string;
  title: string;
  onTitleChange: (title: string) => void;
  celExpression: string;
  onCelExpressionChange: (celExpression: string) => void;
  justification: string;
  onJustificationChange: (justification: string) => void;
}

const VexRuleForm: FunctionComponent<VexRuleFormProps> = ({
  baseUrl,
  title,
  onTitleChange,
  celExpression,
  onCelExpressionChange,
  justification,
  onJustificationChange,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [testingError, setTestingError] = useState<string | null>(null);

  const syntaxError =
    celExpression.trim() !== "" ? checkCelSyntax(celExpression) : null;
  const hasSyntaxError = syntaxError !== null;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const expression = celExpression.trim();
    if (!expression || hasSyntaxError) {
      setMatchCount(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsTesting(true);
      try {
        const resp = await browserApiClient(baseUrl + "/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            celExpression: [expression],
          }),
        });

        if (!resp.ok) {
          setTestingError("Failed to test CEL expression");
          return;
        } else {
          setTestingError(null);
        }

        const data: Record<string, number> = await resp.json();
        setMatchCount(data[expression] ?? 0);
      } finally {
        setIsTesting(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [celExpression, hasSyntaxError, baseUrl]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2">
          <label className="mb-2 block text-sm font-semibold">Title</label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <label className="mb-2 block text-sm font-semibold">
          CEL expression
        </label>
        <div className="h-24">
          <CodeEditor
            value={celExpression}
            language="cel"
            onChange={onCelExpressionChange}
            placeholder={`// examples:\n// vuln.cveId == "CVE-2021-1234"\n// vuln.componentPurl.startsWith("pkg:npm/lodash")\n// vuln.cve.cvss < 4.0\n// matchesPattern(vuln, ["*", "pkg:npm/lodash@4.17.21"])`}
          />
        </div>
        {syntaxError || testingError ? (
          <p className="mt-1 text-xs text-destructive">
            {syntaxError?.message ?? testingError ?? "Unknown error"}
          </p>
        ) : null}
        {!hasSyntaxError && isTesting && (
          <p className="mt-1 text-xs text-muted-foreground">
            Checking how many vulnerabilities this would affect...
          </p>
        )}
        {!hasSyntaxError && !isTesting && matchCount !== null && (
          <p
            className={
              "mt-1 text-xs " +
              (matchCount > 0 ? "text-success" : "text-muted-foreground")
            }
          >
            Matches {matchCount} vulnerabilit
            {matchCount === 1 ? "y" : "ies"}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Justification
        </label>
        <MarkdownEditor
          className="!bg-card"
          placeholder="Add your comment here..."
          value={justification}
          setValue={(value) => onJustificationChange(value ?? "")}
          maxLength={4000}
        />
      </div>
    </div>
  );
};

export default VexRuleForm;
export { type VexRuleFormProps };
