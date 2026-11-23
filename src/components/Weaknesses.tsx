// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type { DetailedDependencyVulnDTO } from "@/types/view/vulnEvents";
import Link from "next/link";
import { type FunctionComponent } from "react";

const Weaknesses: FunctionComponent<{
  vuln: DetailedDependencyVulnDTO;
}> = ({ vuln }) => {
  const cwes = vuln.cve?.cwes ?? [];

  if (cwes.length === 0) {
    return null;
  }

  return (
    <div className="px-5 pb-5">
      <h3 className="pl-1 mb-2 text-xs font-semibold">Weaknesses</h3>
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-wrap justify-start gap-2">
          {cwes.map((cwe) => {
            const id = cwe.replace(/^CWE-/i, "");
            return (
              <Link
                key={cwe}
                href={`https://cwe.mitre.org/data/definitions/${id}.html`}
                target="_blank"
                className="!text-xs"
              >
                CWE-{id}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Weaknesses;
