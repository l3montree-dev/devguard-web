// Copyright (C) 2024 Tim Bastin, l3montree GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import Markdown from "@/components/common/Markdown";
import { markdownComponents } from "@/components/common/markdownComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Advisory } from "@/types/api/api";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { advisorySourceUrl } from "./advisorySourceUrl";
import { parseAdvisoryDescription } from "./parseAdvisoryDescription";

const LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

interface Props {
  advisories: Advisory[];
  variant?: "collapsible" | "static";
}

// component to display available advisories for a given vulnerability
// when viewed on the details page. Its an expandable box with a pulsating dot
// and for each advisory it displays the title and the labeled description.
export default function AdvisoriesCard({
  advisories,
  variant = "collapsible",
}: Props) {
  const isStatic = variant === "static";
  const [expanded, setExpanded] = useState(false);
  const open = isStatic || expanded;

  if (!advisories || advisories.length === 0) return null;

  return (
    <Card className="mb-4 bg-transparent">
      <CardHeader className="p-5">
        {isStatic ? (
          <CardTitle className={LABEL_CLASS}>Description</CardTitle>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex w-full cursor-pointer items-center gap-3 text-left"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <CardTitle className={LABEL_CLASS}>
              {advisories.length > 1
                ? `Advisories (${advisories.length})`
                : "Advisory"}
            </CardTitle>
            <ChevronDown
              className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-8 px-5 pb-5">
          {advisories.map((advisory, index) => {
            const sections = parseAdvisoryDescription(advisory.description);
            const sourceUrl = advisorySourceUrl(advisory.cve);
            return (
              <div key={advisory.cve || index}>
                {!isStatic && advisory.cve && (
                  <div className="mb-5 ml-4 flex items-center gap-2">
                    <p className="font-mono font-semibold text-foreground">
                      {advisory.cve}
                    </p>
                    {sourceUrl && (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${advisory.cve} at the issuing authority`}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
                <dl className="space-y-3">
                  {sections.map((section, i) => (
                    <div
                      key={i}
                      className="border-l-4 border-[hsl(var(--grid-line-color))] pl-6"
                    >
                      {section.label && (
                        <dt className={`${LABEL_CLASS} mb-1`}>
                          {section.label}
                        </dt>
                      )}
                      <dd className="ml-4 text-sm leading-relaxed text-foreground">
                        <Markdown components={markdownComponents}>
                          {section.content}
                        </Markdown>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
