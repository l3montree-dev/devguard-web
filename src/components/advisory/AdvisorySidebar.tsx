// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import Severity from "@/components/common/Severity";
import {
  CVSS31_METRICS,
  CVSS40_METRICS,
  parseCvssVector,
  vectorStringToScore,
} from "@/utils/cvss";
import type { FunctionComponent } from "react";

interface AdvisorySidebarProps {
  severity: string;
  vectorString: string;
}

/**
 * Severity summary of an advisory: score, raw vector and the decoded base
 * metrics of whichever CVSS version the vector was written in.
 */
const AdvisorySidebar: FunctionComponent<AdvisorySidebarProps> = ({
  severity,
  vectorString,
}) => {
  const score = vectorString ? vectorStringToScore(vectorString) : null;
  const parsed = vectorString ? parseCvssVector(vectorString) : null;
  const metricDefs =
    parsed?.version === "4.0"
      ? CVSS40_METRICS
      : parsed?.version === "3.1"
        ? CVSS31_METRICS
        : null;

  // Metrics arrive as a flat list carrying a group label; the label is rendered
  // once, above the first metric that belongs to it.
  const seenGroups = new Set<string>();

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div>
        <div className="mb-2 text-xs font-semibold text-muted-foreground">
          Severity
        </div>
        {score !== null ? (
          <div className="flex">
            <Severity risk={score} />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{severity}</span>
        )}
      </div>

      {vectorString && (
        <div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground">
            Vector
          </div>
          <code className="break-all text-xs text-muted-foreground">
            {vectorString}
          </code>
        </div>
      )}

      {parsed && metricDefs && (
        <div>
          <div className="mb-2 text-xs font-semibold text-muted-foreground">
            CVSS v{parsed.version} Base Metrics
          </div>
          <div className="flex flex-col gap-2">
            {metricDefs.map((metric) => {
              const raw = parsed.metrics[metric.key];
              if (!raw) return null;
              const label =
                metric.options.find((o) => o.v.replace(/[()]/g, "") === raw)
                  ?.l ?? raw;
              const isNewGroup = metric.group && !seenGroups.has(metric.group);
              if (metric.group) seenGroups.add(metric.group);
              return (
                <div key={metric.key}>
                  {isNewGroup && (
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">
                      {metric.group}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <div>{metric.label}</div>
                      <div className="font-semibold">{label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorySidebar;
