// Copyright 2026 L3montree GmbH and the DevGuard Contributors.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

"use client";

import type { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { classNames } from "@/utils/common";
import type { VulnEventDTO } from "@/types/view/vulnEvents";
import { getSeverityClassNames } from "../common/Severity";
import useRouterQuery from "@/hooks/useRouterQuery";

interface Props {
  open: number;
  implemented: number;
  notApplicable: number;
  isLoading: boolean;
}

interface TileProps {
  amount: number;
  variant: VulnEventDTO["type"];
  isLoading: boolean;
  onClick: () => void;
}

const StatTile: FunctionComponent<TileProps> = ({
  amount,
  variant,
  isLoading,
  onClick,
}) => {
  var label = "";
  var severity = "";

  switch (variant) {
    case "detected":
      label = "Not Implemented";
      severity = "CRITICAL";
      break;
    case "implemented":
      label = "Implemented";
      severity = "LOW";
      break;
    case "notApplicable":
      label = "Not applicable";
      severity = "MEDIUM";
      break;
  }
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-row items-start justify-between">
          <span>
            {isLoading ? (
              <Skeleton className="h-10 w-12" />
            ) : (
              <span className="text-4xl">{amount}</span>
            )}
          </span>
          <button onClick={onClick} className="text-xs !text-muted-foreground">
            See all
          </button>
        </CardTitle>
        <CardDescription>
          Amount of compliance postures that are {label.toLowerCase()} for this
          asset version
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mr-2 flex">
          <span
            className={classNames(
              "px-2 mr-2 text-xs font-medium items-center flex flex-row whitespace-nowrap rounded-full p-1",
              getSeverityClassNames(severity, false),
            )}
          >
            {label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const ComplianceStats: FunctionComponent<Props> = ({
  open,
  implemented,
  notApplicable,
  isLoading,
}) => {
  const push = useRouterQuery();

  return (
    <div className="grid w-full grid-cols-3 gap-4">
      <StatTile
        variant="detected"
        amount={open}
        isLoading={isLoading}
        onClick={() =>
          push({
            state: "open",
            "filterQuery[state][is]": null,
            "filterQuery[state][is not]": null,
          })
        }
      />
      <StatTile
        variant="notApplicable"
        amount={notApplicable}
        isLoading={isLoading}
        onClick={() =>
          push({
            state: "closed",
            "filterQuery[state][is]": "notApplicable",
            "filterQuery[state][is not]": null,
          })
        }
      />
      <StatTile
        variant="implemented"
        amount={implemented}
        isLoading={isLoading}
        onClick={() =>
          push({
            state: "closed",
            "filterQuery[state][is]": "implemented",
            "filterQuery[state][is not]": null,
          })
        }
      />
    </div>
  );
};

export default ComplianceStats;
