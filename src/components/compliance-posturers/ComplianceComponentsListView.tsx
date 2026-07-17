// Copyright (C) 2026 l3montree GmbH
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

"use client";

import Page from "@/components/Page";
import EmptyParty from "@/components/common/EmptyParty";
import ListItem from "@/components/common/ListItem";
import Section from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/data-fetcher/fetcher";
import type {
  ComplianceComponentDetailsDTO,
  ComplianceComponentImplementsControlDTO,
} from "@/types/api/api";
import type { FunctionComponent } from "react";
import { useState } from "react";
import useSWR from "swr";
import ComplianceComponentIcon from "./ComplianceComponentIcon";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import InfoTooltip from "../common/InfoTooltip";
import { OSCAL_COMPONENT_EXPLANATION } from "./oscalGlossary";
import ImplementsControlBadge from "./ImplementsControlBadge";

const COLLAPSED_COUNT = 8;

const ComponentControlBadges: FunctionComponent<{
  implementedControls: ComplianceComponentImplementsControlDTO[];
}> = ({ implementedControls }) => {
  const [expanded, setExpanded] = useState(false);

  if (!implementedControls?.length) return null;

  const visible = expanded
    ? implementedControls
    : implementedControls.slice(0, COLLAPSED_COUNT);
  const remaining = implementedControls.length - visible.length;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {visible.map((ic) => (
        <Tooltip key={ic.frameworkControlId}>
          <TooltipTrigger>
            <ImplementsControlBadge
              frameworkControlId={ic.frameworkControlId}
            />
          </TooltipTrigger>
          <TooltipContent>{ic.description}</TooltipContent>
        </Tooltip>
      ))}
      {(remaining > 0 || expanded) &&
        implementedControls.length > COLLAPSED_COUNT && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 px-2 text-xs"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : `+${remaining} more`}
          </Button>
        )}
    </div>
  );
};

interface Props {
  Menu?: any[];
}

const ComplianceComponentsListView: FunctionComponent<Props> = ({ Menu }) => {
  const { data: components, isLoading } = useSWR<
    ComplianceComponentDetailsDTO[]
  >("/compliance-components/", fetcher);

  return (
    <Page
      Menu={Menu}
      title={""}
      Title={null}
      breadcrumbs={[
        {
          title: "Compliance Postures",
          href: ".",
        },
        {
          title: "Components",
          href: "",
        },
      ]}
    >
      <Section
        forceVertical
        primaryHeadline
        Title={
          <span className="flex flex-row items-center gap-1.5">
            Compliance Components
            <InfoTooltip>{OSCAL_COMPONENT_EXPLANATION}</InfoTooltip>
          </span>
        }
        description="Components DevGuard knows about that can implement compliance controls (e.g. branch protection). Attach one to a control from that control's details page to record its implementation status."
        className="mb-4 mt-4"
      >
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from(Array(4).keys()).map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !components?.length ? (
          <EmptyParty
            title="No compliance components tracked yet."
            description="Components are seeded from OSCAL component-definitions."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {components.map((component) => (
              <ListItem
                key={component.uuid}
                Title={
                  <span className="flex flex-row items-center gap-2">
                    <ComplianceComponentIcon title={component.title} />
                    {component.title}
                  </span>
                }
                Description={
                  <>
                    <p>{component.description}</p>
                    <ComponentControlBadges
                      implementedControls={component.implementedControls}
                    />
                  </>
                }
              />
            ))}
          </div>
        )}
      </Section>
    </Page>
  );
};

export default ComplianceComponentsListView;
