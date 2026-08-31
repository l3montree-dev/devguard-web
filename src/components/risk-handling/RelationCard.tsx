// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import Markdown from "@/components/common/Markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CVEDTO } from "@/types/dto";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { advisorySource, advisorySourceUrl } from "./advisorySourceUrl";
import { parseAdvisoryDescription } from "./parseAdvisoryDescription";

interface Props {
  related: CVEDTO[];
  variant?: "collapsible" | "static";
}

export default function RelationCard({
  related,
  variant = "collapsible",
}: Props) {
  const isStatic = variant === "static";
  const [expanded, setExpanded] = useState(false);
  const open = isStatic || expanded;

  if (!related || related.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="p-5">
        {isStatic ? (
          <CardTitle className="">Description</CardTitle>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex w-full cursor-pointer items-start gap-3 text-left"
          >
            <InformationCircleIcon className="h-5 w-5 shrink-0 text-muted-foreground mt-1" />
            <div>
              <CardTitle className="text-base">
                Official EU-CSIRT{" "}
                {related.length > 1
                  ? `Advisories (${related.length})`
                  : "Advisory"}
              </CardTitle>
              <CardDescription className="mt-1">
                From European Unions Computer Security Incident Response Team
                (CSIRT) Network members{" "}
                {related.length > 1 ? "advisories are" : "an advisory is"}{" "}
                present.
              </CardDescription>
            </div>
            <ChevronDown
              className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </CardHeader>
      {open && (
        <CardContent className="space-y-8 border-t pt-6">
          {related.map((advisory, index) => {
            const sections = parseAdvisoryDescription(advisory.description);
            const sourceUrl = advisorySourceUrl(advisory.cve);
            const source = advisorySource(advisory.cve);
            return (
              <div key={advisory.cve || index}>
                {!isStatic && advisory.cve && (
                  <div className="mb-5 flex items-center gap-2">
                    {sourceUrl ? (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${advisory.cve} at the issuing authority`}
                        className="inline-flex items-center gap-1.5 font-mono font-semibold text-foreground transition-colors hover:text-muted-foreground"
                      >
                        {advisory.cve}
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    ) : (
                      <p className="font-mono font-semibold text-foreground">
                        {advisory.cve}
                      </p>
                    )}
                    {source && (
                      <span className="text-sm text-muted-foreground">
                        Source: {source}
                      </span>
                    )}
                  </div>
                )}
                <dl className="space-y-3">
                  {sections.map((section, i) => (
                    <div key={i}>
                      {section.label && (
                        <dt className="mb-1 text-sm font-bold">
                          {section.label}
                        </dt>
                      )}
                      <dd className="text-sm leading-relaxed text-foreground">
                        <Markdown>{section.content}</Markdown>
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
